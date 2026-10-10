// プロトコル・スマッシュ ホットシート版：描画ヘルパー
// 状態を受け取って HTML 文字列を返すだけ。ルールの計算はすべて Engine に任せる。
(function (root) {
  'use strict';

  const SEAT_MARKS = ['●', '▲', '■', '◆'];
  const FACTION_GLYPH = {
    ninja: '忍', pirate: '海', robot: '機', wizard: '魔',
    zombie: '屍', dino: '竜', alien: '星', trick: '罠',
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, ch => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }

  function seatBadge(seat, names, cls) {
    return `<span class="seat-badge s${seat} ${cls || ''}" aria-hidden="true">${SEAT_MARKS[seat]}</span>` +
      (names ? `<span class="seat-name">${esc(names[seat])}</span>` : '');
  }

  function factionChip(D, f) {
    return `<span class="fchip f-${f}"><b>${FACTION_GLYPH[f]}</b>${esc(D.factions[f].name)}</span>`;
  }

  // ログの P1〜P4 を名前に置き換える
  function nameize(line, names) {
    return esc(line.replace(/^R\d+: /, '')).replace(/P([1-4])/g, (_, n) =>
      `<span class="lname s${n - 1}">${SEAT_MARKS[n - 1]}${esc(names[n - 1])}</span>`);
  }

  // ---------- カード ----------
  // c: 状態の中のカード（viewFor 後なら他人の裏向きは cid が null）
  // value: 今の実際の値（基地の上のときだけ）
  function miniCard(D, c, opts) {
    const o = opts || {};
    const tagName = o.static ? 'span' : 'button';
    const attrs = o.static ? '' : `type="button" data-act="card" data-uid="${c.uid}"${o.bi != null ? ` data-bi="${o.bi}"` : ''}`;
    const cls = ['mini'];
    if (o.selected) cls.push('is-selected');
    if (o.covered) cls.push('is-covered');
    if (!c.faceUp) {
      cls.push('is-down');
      const def = c.cid ? D.cards[c.cid] : null;
      if (def) cls.push(`f-${def.faction}`, 'is-known');
      const peek = def ? `<span class="peek"><b>${FACTION_GLYPH[def.faction]}</b>${def.value}</span>` : '';
      const v = o.value != null ? o.value : 2;
      return `<${tagName} class="${cls.join(' ')}" ${attrs} aria-label="${def ? esc(def.name) + '（裏向き）' : '裏向きカード'}">` +
        `${peek}<span class="val">${v}</span><span class="tag">裏</span></${tagName}>`;
    }
    const def = D.cards[c.cid];
    cls.push(`f-${def.faction}`);
    const v = o.value != null ? o.value : def.value;
    const diff = v !== def.value ? `<span class="eff ${v > def.value ? 'up' : 'down'}">${v}</span>` : '';
    return `<${tagName} class="${cls.join(' ')}" ${attrs} aria-label="${esc(def.name)}">` +
      `<span class="glyph">${FACTION_GLYPH[def.faction]}</span><span class="val">${def.value}</span>${diff}` +
      `<span class="nm">${esc(def.name)}</span></${tagName}>`;
  }

  // 手札のカード（効果文つきの少し大きい札）
  function handCard(D, c, selected) {
    const def = D.cards[c.cid];
    return `<button type="button" class="hcard f-${def.faction}${selected ? ' is-selected' : ''}" data-act="hand" data-uid="${c.uid}">` +
      `<span class="hc-top"><span class="glyph">${FACTION_GLYPH[def.faction]}</span><span class="val">${def.value}</span></span>` +
      `<span class="nm">${esc(def.name)}</span></button>`;
  }

  // 拡大表示
  function cardDetail(D, E, state, c, ctx) {
    const o = ctx || {};
    const loc = o.bi != null ? `<p class="cd-where">${esc(D.bases[state.bases[o.bi].id].name)} ／ ${esc(o.ownerName || '')}の列</p>` : '';
    if (!c.cid) {
      return `<div class="cd cd-hidden"><div class="cd-head"><span class="cd-val">${o.value != null ? o.value : 2}</span><h3>裏向きカード</h3></div>` +
        `${loc}<p class="cd-text">中身は持ち主だけが見られる。裏向きのカードは値 2、効果も派閥も持たない（基地や他のカードの効果で値が変わることがある）。</p></div>`;
    }
    const def = D.cards[c.cid];
    let status = '';
    if (o.bi != null) {
      if (c.faceUp) status = `<p class="cd-status ok">表向き。今の値は <b>${o.value}</b></p>`;
      else {
        const why = E.faceUpBlock(D, state, o.bi, c);
        status = `<p class="cd-status">裏向き（今の値 <b>${o.value}</b>）。` +
          (why ? `<span class="ng">${esc(blockText(D, why, o.names))}</span>` : '<span class="ok">この基地なら表向きにできる。</span>') + '</p>';
      }
    }
    return `<div class="cd f-${def.faction}"><div class="cd-head"><span class="cd-val">${def.value}</span>` +
      `<h3>${esc(def.name)}</h3>${factionChip(D, def.faction)}</div>${loc}` +
      `<p class="cd-text">${esc(def.text)}</p>${status}</div>`;
  }

  function blockText(D, why, names) {
    if (!why) return '';
    if (why.code === 'faction') return `表向きにできない：この基地で表向きにできるのは ${why.tags.map(t => D.factions[t].name).join('・')} だけ`;
    if (why.code === 'barrier') return `表向きにできない：${names ? names[why.seat] + 'の' : ''}結界があるため`;
    return '';
  }

  // ---------- 基地 ----------
  // view: viewFor 済みの状態。viewer: 強調する席（null なら強調なし）
  function baseBlock(D, E, view, bi, o) {
    const b = view.bases[bi];
    const bdef = D.bases[b.id];
    const totals = E.totals(D, view, bi);
    const total = totals.reduce((a, x) => a + x, 0);
    const ranks = E.ranking(D, view, bi);
    const proj = E.projectedVP(D, view, bi);
    const pct = Math.min(100, Math.round(100 * total / bdef.bp));
    const hot = total >= bdef.bp;
    const sel = o.selectCard;
    let place = '';
    if (sel) {
      const why = E.faceUpBlock(D, view, bi, sel);
      place = `<button type="button" class="place ${why ? 'no-up' : 'can-up'}${o.selectedBase === bi ? ' is-selected' : ''}" data-act="place" data-bi="${bi}">` +
        `<span class="place-main">${o.selectedBase === bi ? '✓ ここに伏せる' : 'ここに伏せる'}</span>` +
        `<span class="place-sub">${why ? '✕ ' + esc(why.code === 'faction' ? '表にできない（派閥が合わない）' : '表にできない（結界）') : '◎ 公開時に表にできる'}</span></button>`;
    }
    const cols = b.stacks.map((st, s) => {
      const r = ranks[s];
      const has = st.length > 0;
      const cards = st.map((c, i) => miniCard(D, c, {
        bi, value: E.cardValue(D, view, bi, c), covered: i < st.length - 1,
        selected: o.highlight && o.highlight.includes(c.uid),
      })).join('');
      return `<div class="col s${s}${o.viewer === s ? ' is-me' : ''}">` +
        `<div class="col-head">${seatBadge(s)}<span class="col-sum">${totals[s]}</span></div>` +
        `<div class="col-rank">${has ? `<b>${r + 1}位</b><i>+${proj[s]}</i>` : '<span class="dim">—</span>'}</div>` +
        `<div class="stack">${cards}</div></div>`;
    }).join('');
    return `<section class="base${hot ? ' is-hot' : ''}${o.selectedBase === bi ? ' is-target' : ''}" aria-label="${esc(bdef.name)}">` +
      `<header class="base-head"><h2>${esc(bdef.name)}</h2>` +
      `<div class="bp"><span class="bp-now">${total}</span><span class="bp-max">/${bdef.bp}</span></div></header>` +
      `<div class="meter"><span style="width:${pct}%"></span></div>` +
      `<div class="base-info"><span class="vpl">VP ${bdef.vp.map((v, i) => `<i>${i + 1}位${v}</i>`).join('')}</span>` +
      `<span class="tags">表OK ${bdef.tags.map(t => factionChip(D, t)).join('')}</span></div>` +
      (bdef.text ? `<p class="base-rule">${esc(bdef.text)}</p>` : '') +
      `<div class="cols">${cols}</div>${place}</section>`;
  }

  function board(D, E, view, o) {
    return `<div class="board">${view.bases.map((_, bi) => baseBlock(D, E, view, bi, o || {})).join('')}</div>`;
  }

  // ---------- 上部のプレイヤー帯 ----------
  function playersBar(view, names, o) {
    const chips = view.players.map((p, s) => {
      const hand = p.hand.length || p.handCount || 0;
      return `<div class="pchip s${s}${o.viewer === s ? ' is-me' : ''}${view.startPlayer === s ? ' is-start' : ''}">` +
        `${seatBadge(s)}<span class="pc-name">${esc(names[s])}</span>` +
        `<span class="pc-vp">${p.vp}<small>VP</small></span><span class="pc-hand" title="手札">✋${hand}</span></div>`;
    }).join('');
    return `<header class="topbar"><div class="tb-row">` +
      `<span class="round">R<b>${Math.min(view.round, 8)}</b>/8</span>` +
      `<span class="tb-phase">${esc(o.phase || '')}</span>` +
      `<button type="button" class="tb-log" data-act="help" aria-label="ルール">？</button><button type="button" class="tb-log" data-act="log">ログ</button></div>` +
      `<div class="pchips">${chips}</div></header>`;
  }

  function logList(lines, names) {
    if (!lines.length) return '<p class="dim">まだ何も起きていない。</p>';
    let html = '', lastRound = null;
    lines.forEach(l => {
      const m = /^R(\d+):/.exec(l);
      const r = m ? m[1] : '';
      if (r !== lastRound) { html += `<li class="log-round">ラウンド ${r}</li>`; lastRound = r; }
      html += `<li class="${/採点/.test(l) ? 'is-score' : ''}">${nameize(l, names)}</li>`;
    });
    return `<ol class="log">${html}</ol>`;
  }

  // 公開の再生単位：1 人分の公開（とその効果）か、1 回の採点（とその後始末）で 1 まとまり
  const HEAD_KINDS = ['reveal', 'refresh', 'gone', 'score'];
  function groupFrames(frames) {
    const groups = [];
    (frames || []).forEach(f => {
      const head = f.meta && HEAD_KINDS.includes(f.meta.kind);
      if (head || !groups.length) groups.push({ head: f, rest: [] });
      else groups[groups.length - 1].rest.push(f);
    });
    return groups;
  }

  root.UI = {
    groupFrames,
    SEAT_MARKS, FACTION_GLYPH, esc, seatBadge, factionChip, nameize,
    miniCard, handCard, cardDetail, blockText, board, baseBlock, playersBar, logList,
  };
})(typeof window !== 'undefined' ? window : globalThis);
