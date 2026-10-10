// プロトコル・スマッシュ ホットシート版：画面ごとの描画
// App の状態から HTML を組み立てて #app に流し込む。
(function (root) {
  'use strict';

  const E = root.Engine;
  const UI = root.UI;
  const { esc, seatBadge, factionChip } = UI;

  const PURPOSE = {
    deal: '秘密の目標を確認します',
    plan: 'カードを1枚伏せます',
    resolve: '公開フェーズで、あなただけが見て決める選択があります',
  };

  let lastKey = '';

  function render(App) {
    const S = App.S, T = App.T;
    const root = document.getElementById('app');
    let html, key;
    if (!S) { html = title(App); key = 'title'; }
    else if (S.gate) { html = gate(App); key = `gate-${S.gate.seat}-${S.gate.purpose}`; }
    else {
      key = S.screen;
      switch (S.screen) {
        case 'draft': html = draft(App); key += S.draft.step; break;
        case 'deal': html = deal(App); key += S.deal.queue[0]; break;
        case 'plan': html = plan(App); key += S.plan.idx + '-' + S.game.round; break;
        case 'resolve': html = resolve(App); key += S.res.answers.length; break;
        case 'result': html = result(App); break;
        case 'final': html = finalScreen(App); break;
        default: html = '';
      }
    }
    if (T.error) html += `<div class="toast-error" role="alert"><p>${esc(T.error)}</p>` +
      (S && S.res ? '<button type="button" class="btn" data-act="retry">このラウンドの公開をやり直す</button>' : '') + '</div>';
    html += overlays(App);
    root.innerHTML = html;
    root.dataset.screen = S ? (S.gate ? 'gate' : S.screen) : 'title';
    if (key !== lastKey) { window.scrollTo(0, 0); lastKey = key; }
  }

  // ---------- タイトル ----------
  function title(App) {
    const T = App.T;
    if (!T.form) T.form = { names: ['', '', '', ''], bots: [false, true, true, true] };
    const saved = App.loadSaved();
    const rows = [0, 1, 2, 3].map(s => `<li class="seat-row s${s}">${seatBadge(s)}` +
      `<input type="text" maxlength="10" inputmode="text" autocomplete="off" placeholder="${T.form.bots[s] ? 'ボット' : `プレイヤー${s + 1}`}" ` +
      `value="${esc(T.form.names[s])}" data-name="${s}" aria-label="${s + 1}番席の名前">` +
      `<button type="button" class="toggle${T.form.bots[s] ? ' is-bot' : ''}" data-act="toggle-bot" data-seat="${s}" aria-pressed="${T.form.bots[s]}">` +
      `${T.form.bots[s] ? 'ボット' : '人間'}</button></li>`).join('');
    const humans = T.form.bots.filter(b => !b).length;
    return `<main class="screen title-screen">
      <div class="logo"><span class="logo-en">PROTOCOL<br>SMASH</span><h1>プロトコル・スマッシュ</h1></div>
      <p class="lede">4 つの基地を 4 人で取り合う。<br>伏せて置き、表か裏かを選んで公開する。</p>
      ${saved ? `<div class="resume"><p>途中のゲームがあります（ラウンド ${saved.game ? Math.min(saved.game.round, 8) : 1}）</p><button type="button" class="btn primary" data-act="resume">続きから遊ぶ</button></div>` : ''}
      <section class="panel"><h2 class="panel-h">席と名前</h2><p class="hint">1 番席から時計回り。1 台の端末を順番に回して遊ぶ。ボットにした席は自動で打つ。</p>
      <ol class="seats">${rows}</ol>
      <button type="button" class="btn primary big" data-act="start">${saved ? '新しいゲームを始める' : 'ゲームを始める'}</button>
      <p class="hint center">人間 ${humans} 人 ／ ボット ${4 - humans} 人</p></section>
      <p class="foot"><a href="RULES.md" target="_blank" rel="noopener">ルールブック</a> ・ <a href="CARDS.md" target="_blank" rel="noopener">カードリスト</a></p>
    </main>`;
  }

  // ---------- 目隠し ----------
  function gate(App) {
    const S = App.S, g = S.gate;
    if (g.seat == null) {
      return `<main class="screen gate-screen"><div class="gate-card">
        <p class="gate-kicker">ラウンド ${S.game.round}</p><h1>全員の配置が<br>終わりました</h1>
        <p>端末をテーブルの真ん中に置いて、みんなで公開を見よう。</p>
        <button type="button" class="btn primary big" data-act="gate-ok">公開を始める</button></div></main>`;
    }
    const name = S.names[g.seat];
    return `<main class="screen gate-screen s${g.seat}"><div class="gate-card">
      <p class="gate-kicker">次は</p>
      <h1>${seatBadge(g.seat)}<span>${esc(name)}</span><small>さん</small></h1>
      <p class="gate-warn">${esc(name)}さん以外は画面を見ないでください</p>
      <p class="gate-why">${esc(PURPOSE[g.purpose] || '')}</p>
      <button type="button" class="btn primary big" data-act="gate-ok">${esc(name)}です。表示する</button></div></main>`;
  }

  // ---------- ドラフト ----------
  function draft(App) {
    const S = App.S, D = App.D, T = App.T, dr = S.draft;
    const seat = App.draftSeat();
    const isBot = S.bots[seat];
    const order = App.DRAFT_ORDER.map((s, i) =>
      `<li class="${i < dr.step ? 'done' : ''}${i === dr.step ? ' now' : ''}">${seatBadge(s)}</li>`).join('');
    const picks = [0, 1, 2, 3].map(s => `<li class="${s === seat ? 'now' : ''}">${seatBadge(s, S.names)}` +
      `<span class="picks">${dr.picks[s].map(f => factionChip(D, f)).join('') || '<span class="dim">未選択</span>'}</span></li>`).join('');
    const tiles = dr.pool.map(f => {
      const fd = D.factions[f];
      const open = T.draftFocus === f;
      const cards = open ? D.raw.cards.filter(c => c.faction === f).map(c =>
        `<li><span class="mini-inline f-${f}">${c.value}</span><b>${esc(c.name)}</b><span>${esc(c.text)}</span></li>`).join('') : '';
      return `<article class="ftile f-${f}${open ? ' is-open' : ''}">
        <button type="button" class="ftile-head" data-act="draft-focus" data-f="${f}" aria-expanded="${open}">
          <span class="fglyph">${UI.FACTION_GLYPH[f]}</span><span class="fname">${esc(fd.name)}</span><span class="fverb">${esc(fd.verb)}</span></button>
        <p class="fgood">${esc(fd.good)}</p>
        ${open ? `<dl class="fmore"><dt>弱み</dt><dd>${esc(fd.bad)}</dd><dt>勝ち筋</dt><dd>${esc(fd.win)}</dd></dl><ol class="fcards">${cards}</ol>
        ${isBot ? '' : `<button type="button" class="btn primary" data-act="draft-pick" data-f="${f}">${esc(fd.name)}を取る</button>`}` : ''}
      </article>`;
    }).join('');
    return `<main class="screen draft-screen">
      <header class="phase-head"><p class="kicker">準備 ・ 派閥ドラフト ${dr.step + 1}/8</p>
        <h1>${seatBadge(seat)} ${esc(S.names[seat])}さんが選ぶ番${isBot ? '<span class="botnote">（ボットが選んでいます…）</span>' : ''}</h1>
        <ol class="draft-order" aria-label="指名順">${order}</ol></header>
      <ul class="draft-picks">${picks}</ul>
      <p class="hint">派閥をタップすると、カード 6 枚と特徴が見られる。2 つの派閥を混ぜて 12 枚の山札にする。</p>
      <div class="ftiles">${tiles}</div>
      <button type="button" class="btn ghost small" data-act="quit">タイトルに戻る</button>
    </main>`;
  }

  // ---------- 目標の確認 ----------
  function deal(App) {
    const S = App.S, D = App.D;
    const seat = S.deal.queue[0];
    const p = S.game.players[seat];
    const o = D.objectives[p.objective];
    return `<main class="screen deal-screen">
      <header class="phase-head"><p class="kicker">準備 ・ 秘密の目標</p><h1>${seatBadge(seat, S.names)}さんの目標</h1></header>
      <article class="objective-card"><p class="oc-kicker">秘密の目標 ・ 達成で +${o.vp}VP</p><h2>${esc(o.name)}</h2><p>${esc(o.text)}</p></article>
      <p class="hint">あなたの派閥：${p.factions.map(f => factionChip(D, f)).join('')}</p>
      <p class="hint">目標はゲーム中いつでも、自分の番の画面上の「目標」から見直せる。</p>
      <button type="button" class="btn primary big" data-act="deal-ok">覚えた（隠して次へ）</button>
    </main>`;
  }

  // ---------- 配置 ----------
  function plan(App) {
    const S = App.S, D = App.D, T = App.T;
    const seat = S.plan.order[S.plan.idx];
    const view = E.viewFor(S.game, seat);
    const me = view.players[seat];
    const sel = T.planSel != null ? me.hand.find(c => c.uid === T.planSel) : null;
    const o = D.objectives[me.objective];
    let dock;
    if (sel) {
      const def = D.cards[sel.cid];
      dock = `<div class="dock-detail f-${def.faction}"><b>${def.value} ${esc(def.name)}</b><span>${esc(def.text)}</span></div>` +
        (T.planBase == null ? '<p class="dock-hint">↑ 伏せる基地を選ぶ（各基地の下のボタン）</p>'
          : `<p class="dock-hint">「${esc(def.name)}」を <b>${esc(D.bases[view.bases[T.planBase].id].name)}</b> に伏せる</p>`);
    } else if (T.planRefresh) {
      dock = `<p class="dock-hint">リフレッシュ：何も置かず、公開のときに手札が 5 枚になるまで引く。</p>`;
    } else {
      dock = `<p class="dock-hint">手札から 1 枚選んで基地に伏せる。または「リフレッシュ」。</p>`;
    }
    const ready = T.planRefresh || (sel && T.planBase != null);
    return `${UI.playersBar(view, S.names, { viewer: seat, phase: `${S.names[seat]}さん：配置` })}
      <main class="screen play-screen">
        <div class="mine"><button type="button" class="objchip" data-act="objective" data-seat="${seat}">目標：${esc(o.name)}</button>
          <span class="myfac">${me.factions.map(f => factionChip(D, f)).join('')}</span></div>
        ${UI.board(D, E, view, { viewer: seat, selectCard: sel, selectedBase: T.planBase })}
      </main>
      <footer class="dock">
        <div class="hand" aria-label="手札">${me.hand.map(c => UI.handCard(D, c, c.uid === T.planSel)).join('') || '<span class="dim">手札がない</span>'}</div>
        ${dock}
        <div class="dock-actions">
          <button type="button" class="btn${T.planRefresh ? ' is-on' : ''}" data-act="refresh">リフレッシュ</button>
          <button type="button" class="btn primary" data-act="plan-ok"${ready ? '' : ' disabled'}>決定</button>
        </div>
      </footer>`;
  }

  // ---------- 公開中の選択 ----------
  const KIND_TITLE = {
    faceUp: '表にする？ 裏のままにする？',
    discard: '手札を 1 枚捨てる',
    recover: '捨て札から 1 枚を手札に加える',
    extraPlay: '手札 1 枚を裏向きで追加で出す',
    extraPlayUp: '手札 1 枚をこの基地に追加で出す',
    flipUpOwn: '自分の裏向きカード 1 枚を表向きにする',
    reanimate: '捨て札のカードを裏向きで出す',
    move: '自分のカード 1 枚を別の基地へ移動する',
    flipDown: '他人の表向きカード 1 枚を裏向きにする',
    bounce: '他人のカード 1 枚を持ち主の手札に戻す',
    smoke: '煙玉：このカードを裏向きにして 2 枚引く？',
    moveSelf: 'このカードを別の基地へ移動する？',
    moveOther: '他人のカード 1 枚を別の基地へ移動する',
    terraform: '入れ替える基地を選ぶ',
  };

  function resolve(App) {
    const S = App.S, D = App.D, res = S.res;
    const p = res.pending;
    if (!p) return `<main class="screen"><p>処理中…</p></main>`;
    const secret = App.SECRET_KINDS.includes(p.kind);
    const view = E.viewFor(res.mid, secret ? p.seat : -1);
    const recent = res.mid.log.slice(res.before.log.length);
    const highlight = p.options.map(o => Array.isArray(o) ? o[0] : o).filter(x => typeof x === 'number');
    return `${UI.playersBar(view, S.names, { viewer: secret ? p.seat : null, phase: '公開フェーズ' })}
      <main class="screen play-screen">
        <section class="ticker"><h2>このラウンド</h2>${recent.length ? UI.logList(recent.slice(-6), S.names) : '<p class="dim">公開が始まった。</p>'}</section>
        ${UI.board(D, E, view, { viewer: secret ? p.seat : null, highlight: p.kind === 'terraform' ? [] : highlight })}
      </main>
      <footer class="dock dock-choice">
        <p class="who">${seatBadge(p.seat, S.names)}さんの選択${secret ? '<span class="secret">本人だけ</span>' : ''}</p>
        <h2 class="ask">${esc(KIND_TITLE[p.kind] || p.kind)}</h2>
        ${choiceBody(App, view, p)}
      </footer>`;
  }

  // 候補カードの場所と説明
  function locate(view, uid) {
    for (let bi = 0; bi < view.bases.length; bi++) {
      for (let s = 0; s < 4; s++) {
        const c = view.bases[bi].stacks[s].find(x => x.uid === uid);
        if (c) return { card: c, bi, owner: s, where: 'board' };
      }
    }
    for (const p of view.players) {
      let c = p.hand.find(x => x.uid === uid);
      if (c) return { card: c, owner: p.seat, where: 'hand' };
      c = p.trash.find(x => x.uid === uid);
      if (c) return { card: c, owner: p.seat, where: 'trash' };
    }
    return null;
  }

  function cardLabel(App, view, uid) {
    const D = App.D, f = locate(view, uid);
    if (!f) return { html: '（不明なカード）', mini: '' };
    const c = f.card;
    const name = c.cid ? `「${D.cards[c.cid].name}」` : '裏向きカード';
    if (f.where === 'board') {
      const v = E.cardValue(D, view, f.bi, c);
      return {
        mini: UI.miniCard(D, c, { value: v, static: true }),
        html: `<span class="ol-main">${esc(App.S.names[f.owner])} の${esc(name)}</span><span class="ol-sub">${esc(D.bases[view.bases[f.bi].id].name)} ・ 値 ${v}${c.faceUp ? '' : '（裏）'}</span>`,
      };
    }
    const def = D.cards[c.cid];
    return {
      mini: UI.miniCard(D, Object.assign({}, c, { faceUp: true }), { static: true }),
      html: `<span class="ol-main">${esc(name)}</span><span class="ol-sub">${f.where === 'hand' ? '手札' : '捨て札'} ・ ${esc(def.text)}</span>`,
    };
  }

  function choiceBody(App, view, p) {
    const S = App.S, D = App.D, T = App.T;
    const okBtn = `<button type="button" class="btn primary big" data-act="answer"${T.pick == null ? ' disabled' : ''}>決定</button>`;
    const opt = (i, inner, extra) => `<button type="button" class="opt${T.pick === i ? ' is-selected' : ''} ${extra || ''}" data-act="opt" data-i="${i}">${inner}</button>`;

    if (p.kind === 'faceUp') {
      const full = S.res.mid;
      const f = E.findCard(full, p.info.uid);
      const c = f.card, def = D.cards[c.cid];
      const vDown = E.cardValue(D, full, f.bi, c);
      const probe = JSON.parse(JSON.stringify(full));
      E.findCard(probe, c.uid).card.faceUp = true;
      const vUp = E.cardValue(D, probe, f.bi, E.findCard(probe, c.uid).card);
      return `<div class="reveal-card f-${def.faction}"><span class="rc-val">${def.value}</span><div><b>${esc(def.name)}</b>` +
        `<small>${esc(D.bases[full.bases[f.bi].id].name)} に置いたカード</small><p>${esc(def.text)}</p></div></div>
        <div class="opts two">${opt(0, `<b>表にする</b><span>値 ${vUp}・効果が出る</span>`, 'up')}${opt(1, `<b>裏のまま</b><span>値 ${vDown}・中身は秘密</span>`, 'down')}</div>${okBtn}`;
    }
    if (p.kind === 'smoke') {
      return `<div class="opts two">${opt(0, '<b>裏向きにして 2 枚引く</b>')}${opt(1, '<b>そのまま</b>')}</div>${okBtn}`;
    }
    const isPair = p.options.some(o => Array.isArray(o));
    if (isPair) {
      // 1 段目：カード → 2 段目：基地
      const uids = [...new Set(p.options.filter(o => Array.isArray(o)).map(o => o[0]))];
      const nullIdx = p.options.findIndex(o => o === null);
      let html = '<div class="opts">';
      uids.forEach(uid => {
        const lab = cardLabel(App, view, uid);
        html += `<button type="button" class="opt card-opt${T.pickCard === uid ? ' is-selected' : ''}" data-act="opt-card" data-uid="${uid}">${lab.mini}<span class="ol">${lab.html}</span></button>`;
      });
      if (nullIdx >= 0) html += opt(nullIdx, '<b>しない</b>', 'skip');
      html += '</div>';
      if (T.pickCard != null) {
        html += '<p class="sub-ask">どの基地へ？</p><div class="opts bases">';
        p.options.forEach((o, i) => {
          if (Array.isArray(o) && o[0] === T.pickCard) html += opt(i, `<b>${esc(D.bases[view.bases[o[1]].id].name)}</b>`);
        });
        html += '</div>';
      }
      return html + okBtn;
    }
    const isBaseIdx = p.kind === 'terraform' || p.kind === 'moveSelf';
    let html = '<div class="opts">';
    p.options.forEach((o, i) => {
      if (o === null) html += opt(i, `<b>${p.kind === 'moveSelf' ? '移動しない' : 'しない'}</b>`, 'skip');
      else if (isBaseIdx) html += opt(i, `<b>${esc(D.bases[view.bases[o].id].name)}</b>`);
      else { const lab = cardLabel(App, view, o); html += opt(i, `${lab.mini}<span class="ol">${lab.html}</span>`, 'card-opt'); }
    });
    return html + '</div>' + okBtn;
  }

  // ---------- ラウンドの結果 ----------
  function scoreRows(App, events) {
    const S = App.S, D = App.D;
    if (!events.length) return '<p class="dim">このラウンドに採点された基地はない。</p>';
    return events.map(ev => {
      const seats = Object.keys(ev.ranks).map(Number).sort((a, b) => ev.ranks[a] - ev.ranks[b]);
      return `<article class="score-card"><h3>${esc(D.bases[ev.baseId].name)}${ev.final ? '<span class="final-tag">最終採点</span>' : ''}</h3><ol>` +
        seats.map(s => `<li class="r${ev.ranks[s]}"><span class="rk">${ev.ranks[s] + 1}位</span>${seatBadge(s, S.names)}<span class="gain">+${ev.gained[s]}</span></li>`).join('') +
        '</ol></article>';
    }).join('');
  }

  function vpTable(App, before, after) {
    const S = App.S;
    const rows = after.players.map(p => ({ s: p.seat, vp: p.vp, d: p.vp - before.players[p.seat].vp }))
      .sort((a, b) => b.vp - a.vp);
    return `<ol class="vp-table">${rows.map(r => `<li>${seatBadge(r.s, S.names)}<span class="vp">${r.vp}<small>VP</small></span>` +
      `<span class="delta${r.d ? '' : ' zero'}">${r.d ? '+' + r.d : '±0'}</span></li>`).join('')}</ol>`;
  }

  function result(App) {
    const S = App.S, D = App.D;
    const { before, after } = S.result;
    const view = E.viewFor(after, -1);
    const barView = Object.assign({}, view, { round: before.round, startPlayer: before.startPlayer });
    const evs = (after.events || []).filter(e => e.round === before.round);
    const lines = after.log.slice(before.log.length);
    return `${UI.playersBar(barView, S.names, { viewer: null, phase: 'ラウンドの結果' })}
      <main class="screen result-screen">
        <header class="phase-head"><p class="kicker">ラウンド ${before.round} / 8</p><h1>${evs.length ? '採点が起きた' : 'ラウンド終了'}</h1></header>
        <section class="scores">${scoreRows(App, evs)}</section>
        <section class="panel"><h2 class="panel-h">得点</h2>${vpTable(App, before, after)}</section>
        <section class="panel"><h2 class="panel-h">起きたこと</h2>${UI.logList(lines, S.names)}</section>
        <button type="button" class="btn primary big" data-act="next">${after.over ? '最終結果へ（目標を公開）' : `ラウンド ${after.round} へ`}</button>
        ${after.over ? '' : `<h2 class="sec-h">次のラウンドの基地</h2>${UI.board(D, E, view, {})}`}
      </main>`;
  }

  // ---------- 最終結果 ----------
  function finalScreen(App) {
    const S = App.S, D = App.D, g = S.game;
    const objs = g.players.map(p => {
      const o = D.objectives[p.objective];
      return `<li class="obj-reveal${p.objectiveMet ? ' met' : ''}"><span class="obj-who">${seatBadge(p.seat, S.names)}</span>` +
        `<div><b>${esc(o.name)}</b><small>${esc(o.text)}</small></div><span class="obj-res">${p.objectiveMet ? `達成 +${o.vp}` : '未達成'}</span></li>`;
    }).join('');
    const order = g.players.slice().sort((a, b) => b.vp - a.vp);
    let rank = 0;
    const standings = order.map((p, i) => {
      if (i > 0 && order[i - 1].vp !== p.vp) rank = i;
      const win = g.winners.includes(p.seat);
      const objVp = p.objectiveMet ? D.objectives[p.objective].vp : 0;
      return `<li class="${win ? 'winner' : ''}" style="--i:${i}"><span class="st-place">${rank + 1}</span>${seatBadge(p.seat, S.names)}` +
        `<span class="vp">${p.vp}<small>VP</small></span><span class="split">基地 ${p.vp - objVp}${objVp ? ` ＋ 目標 ${objVp}` : ''}</span></li>`;
    }).join('');
    const winNames = g.winners.map(s => S.names[s] + 'さん').join('と');
    return `<main class="screen final-screen">
      <header class="phase-head"><p class="kicker">ゲーム終了</p><h1 class="winner-h"><span>${esc(winNames)}</span>の勝ち${g.winners.length > 1 ? '（勝ちを分け合う）' : ''}</h1></header>
      <section class="panel"><h2 class="panel-h">最終順位</h2><ol class="standings">${standings}</ol></section>
      <section class="panel"><h2 class="panel-h">秘密の目標</h2><ul class="objs">${objs}</ul></section>
      <section class="panel"><h2 class="panel-h">最終採点</h2>${scoreRows(App, (g.events || []).filter(e => e.final))}</section>
      <div class="row-btns"><button type="button" class="btn primary" data-act="again">同じ席でもう一度</button>
      <button type="button" class="btn" data-act="title">タイトルへ</button></div>
      <details class="panel"><summary>全部のログ</summary>${UI.logList(g.log, S.names)}</details>
    </main>`;
  }

  // ---------- 重ね表示（カード拡大・目標・ログ） ----------
  function currentView(App) {
    const S = App.S;
    if (!S) return null;
    if (S.screen === 'plan' && S.plan) return { view: E.viewFor(S.game, S.plan.order[S.plan.idx]), viewer: S.plan.order[S.plan.idx] };
    if (S.screen === 'resolve' && S.res && S.res.pending) {
      const p = S.res.pending, secret = App.SECRET_KINDS.includes(p.kind);
      return { view: E.viewFor(S.res.mid, secret ? p.seat : -1), viewer: secret ? p.seat : null };
    }
    if (S.screen === 'result' && S.result) return { view: E.viewFor(S.result.after, -1), viewer: null };
    if (S.game) return { view: E.viewFor(S.game, -1), viewer: null };
    return null;
  }

  function overlays(App) {
    const S = App.S, D = App.D, T = App.T;
    if (!S || S.gate) return '';
    const cv = currentView(App);
    let inner = '';
    if (T.logOpen && cv) {
      inner = `<h2 class="sheet-h">行動ログ</h2>${UI.logList(cv.view.log, S.names)}`;
    } else if (T.modal && T.modal.type === 'objective' && cv && cv.viewer === T.modal.seat) {
      const o = D.objectives[S.game.players[T.modal.seat].objective];
      inner = `<article class="objective-card"><p class="oc-kicker">秘密の目標 ・ 達成で +${o.vp}VP</p><h2>${esc(o.name)}</h2><p>${esc(o.text)}</p></article>`;
    } else if (T.modal && T.modal.type === 'card' && cv) {
      const f = locate(cv.view, T.modal.uid);
      if (f) {
        const value = f.where === 'board' ? E.cardValue(D, cv.view, f.bi, f.card) : null;
        inner = UI.cardDetail(D, E, cv.view, f.card, { bi: f.where === 'board' ? f.bi : null, value, ownerName: S.names[f.owner], names: S.names });
      }
    }
    if (!inner) return '';
    return `<div class="overlay" data-act="close"><div class="sheet" role="dialog" aria-modal="true">${inner}` +
      `<button type="button" class="btn sheet-close" data-act="close">閉じる</button></div></div>`;
  }

  function loadError(msg) {
    return `<main class="screen load-error"><h1>カードデータを読み込めませんでした</h1><p>${esc(msg)}</p>
      <p>ブラウザによっては、ファイルを直接開くとデータを読めません。<code>game</code> フォルダで簡単なサーバーを立ててから開いてください。</p>
      <pre>node game/serve.js</pre><p>→ <code>http://localhost:8080/</code> を開く</p></main>`;
  }

  root.Screens = { render, loadError };
})(typeof window !== 'undefined' ? window : globalThis);
