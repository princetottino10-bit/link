// プロトコル・スマッシュ：遊び方（5 ページ）
// 本物の画面部品（基地・カード）を使って、ルールと画面の見方を説明する。
(function (root) {
  'use strict';

  const E = root.Engine;
  const UI = root.UI;
  const SEEN_KEY = 'protocol-smash-tutorial-seen';
  const DEMO_NAMES = ['あなた', 'ボットA', 'ボットB', 'ボットC'];

  function seen() { try { return localStorage.getItem(SEEN_KEY) === '1'; } catch (e) { return false; } }
  function markSeen() { try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* 保存できなくてもよい */ } }

  // 説明用の盤面：古代遺跡（耐久 11、忍者・海賊が表OK）に 3 人がカードを置いた状態
  let demo = null;
  function demoState(D) {
    if (demo) return demo;
    const s = E.setup(D, [['pirate', 'ninja'], ['robot', 'wizard'], ['dino', 'zombie'], ['alien', 'trick']], 1);
    const take = (seat, cid) => {
      const p = s.players[seat];
      for (const pile of [p.hand, p.deck]) {
        const i = pile.findIndex(c => c.cid === cid);
        if (i >= 0) return pile.splice(i, 1)[0];
      }
      return null;
    };
    s.bases[0].id = 'b01';
    const put = (seat, cid, up) => { const c = take(seat, cid); c.faceUp = up; s.bases[0].stacks[seat].push(c); return c; };
    put(0, 'p6', true);   // あなた：船長（表）6
    put(1, 'r3', false);  // ボットA：裏向き 2
    put(2, 'd5', false);  // ボットB：裏向き 2
    s.players[0].hand = [take(0, 'p3'), take(0, 'n2'), take(0, 'p5')].filter(Boolean);
    demo = s;
    return s;
  }

  function pages(App) {
    const D = App.D;
    const s = demoState(D);
    const view = E.viewFor(s, 0);
    const base = UI.baseBlock(D, E, view, 0, { viewer: 0, names: DEMO_NAMES });
    const hand = view.players[0].hand.map(c => UI.handCard(D, c, false)).join('');
    const upCard = s.bases[0].stacks[0][0];
    const downCard = Object.assign({}, s.bases[0].stacks[1][0], { cid: null });
    return [
      {
        title: '目的：VP をいちばん集める',
        html: `<p>4 人で、場にある <b>4 つの「基地」</b>を取り合うゲーム。</p>
          <p>基地が<b>「採点」</b>されると、その基地にカードを多く（値の合計を大きく）置いた順に <b>VP（勝利点）</b>がもらえる。</p>
          <p><b>8 ラウンド</b>遊んで、VP がいちばん多い人の勝ち。</p>
          <p>相手は人間でも AI でもいい。AI は相手の派閥や盤面から置き場所を読み、先頭の人を止めにくる。</p>
          <p class="tut-note">画面の上の帯が、各プレイヤーの VP と手札の枚数（✋）。</p>`,
      },
      {
        title: '基地の見方',
        html: `${base}
          <ol class="tut-points">
            <li><b>合計 / 耐久</b>：全員のカードの値の合計。<b>耐久</b>の数に届くと、その基地は採点される。</li>
            <li><b>採点でもらえる VP</b>：1 位・2 位…がそれぞれ何 VP もらえるか。</li>
            <li><b>表にできる派閥</b>：この基地で表向き（効果あり）にできるカードの種類。</li>
            <li><b>4 つの列</b>：各プレイヤーが置いたカード。「合計」がその人の値の合計、「今 1 位 +4VP」は<b>今採点されたら</b>の順位と VP。黄色の列があなた。</li>
          </ol>`,
      },
      {
        title: '毎ラウンド：1〜2 枚を伏せて置く',
        html: `<div class="tut-hand">${hand}</div>
          <p>全員が<b>同時に</b>、手札から <b>1〜2 枚</b>を選んで、好きな基地の自分の列に<b>伏せて（裏向きで）</b>置く。2 枚は同じ基地でも別々でもいい。ほかの人が何をどこに置いたかは、公開まで分からない。</p>
          <p>2 枚置くと場は強くなるが、手札が早く減る。手札が尽きるとリフレッシュで 1 ラウンド休むことになる。</p>
          <p>置く代わりに<b>リフレッシュ</b>もできる：何も置かず、手札が 5 枚になるまで引く。</p>
          <p class="tut-note">操作：手札をタップ → 基地の下の「ここに伏せる」（もう 1 枚置くなら繰り返す）→ 「決定」。</p>`,
      },
      {
        title: '公開：表にする？ 裏のまま？',
        html: `<div class="tut-cards"><div>${UI.miniCard(D, upCard, { static: true })}<p><b>表</b>：書かれた値（ここでは 6）＋効果</p></div>
          <div>${UI.miniCard(D, downCard, { static: true, value: 2 })}<p><b>裏</b>：値はいつも 2、効果なし</p></div></div>
          <p>全員が置いたら、<b>「先」マークの人から順に</b>、置いた順に 1 枚ずつめくる。自分の番で、<b>表にするか、裏のままにするか</b>を選ぶ。</p>
          <p>表にできるのは、その基地の<b>「表にできる派閥」</b>のカードだけ。合わない基地に置いたカードは、裏の値 2 で数える。</p>
          <p class="tut-note">大きい数のカードは表にしたいので、派閥の合う基地に置くのが基本。効果で相手のカードを手札に戻したり、動かしたりもできる。</p>`,
      },
      {
        title: '採点とゲームの終わり',
        html: `<p>ラウンドの終わりに、合計が<b>耐久に届いた基地</b>を採点する。列の合計が大きい順に 1〜4 位の VP が入る（同点は同じ順位）。</p>
          <p>採点した基地のカードは捨て札になり、<b>新しい基地</b>が出てくる。</p>
          <p><b>8 ラウンド目</b>の終わりには、カードが残っている基地を全部採点。最後に<b>秘密の目標</b>（達成で +3VP）を足して、VP が多い人の勝ち。</p>
          <p class="tut-note">カードをタップすると効果の説明が出る。上の「？」でいつでもこの説明に戻れる。</p>`,
      },
    ];
  }

  function body(App) {
    const T = App.T;
    const list = pages(App);
    const i = Math.max(0, Math.min(T.tut, list.length - 1));
    const pg = list[i];
    const last = i === list.length - 1;
    const dots = list.map((_, k) => `<span class="${k === i ? 'on' : ''}"></span>`).join('');
    const finish = T.tutStart ? '<button type="button" class="btn primary" data-act="tut-start">ゲームを始める</button>'
      : '<button type="button" class="btn primary" data-act="tut-close">閉じる</button>';
    return `<div class="tut"><p class="kicker">遊び方 ${i + 1}/${list.length}</p><h2 class="tut-title">${pg.title}</h2>
      <div class="tut-body">${pg.html}</div>
      <div class="tut-dots" aria-hidden="true">${dots}</div>
      <div class="tut-nav">
        ${i > 0 ? '<button type="button" class="btn" data-act="tut-prev">戻る</button>' : `<button type="button" class="btn ghost" data-act="${T.tutStart ? 'tut-start' : 'tut-close'}">飛ばす</button>`}
        ${last ? finish : '<button type="button" class="btn primary" data-act="tut-next">次へ ▶</button>'}
      </div></div>`;
  }

  root.Tutorial = { body, seen, markSeen };
})(typeof window !== 'undefined' ? window : globalThis);
