// プロトコル・スマッシュ ホットシート版：進行の管理
// 1 台の端末を 4 人で回して遊ぶ。ルールは Engine（engine.js）、ボットは Bots（bots.js）をそのまま使う。
// ゲームの状態はすべて S に入れ、操作のたびに localStorage へ保存する（再読み込みしても続きから遊べる）。
(function () {
  'use strict';

  const E = window.Engine;
  const SAVE_KEY = 'protocol-smash-hotseat-v1';
  const DRAFT_ORDER = [0, 1, 2, 3, 3, 2, 1, 0];
  // 本人以外に見せてはいけない情報（手札・自分の裏向きの中身）を含む選択
  const SECRET_KINDS = ['faceUp', 'discard', 'recover', 'extraPlay', 'extraPlayUp', 'flipUpOwn', 'reanimate', 'move'];
  const BOT_DELAY_MS = 450;

  const App = {
    D: null, B: null,
    S: null,                       // 保存する状態
    T: freshTransient(),           // 保存しない画面だけの状態
  };
  window.App = App;

  function freshTransient() {
    return { tut: null, tutStart: false, modal: null, logOpen: false, planSel: null, planBase: null, planRefresh: false, pick: null, pickCard: null, draftFocus: null, form: null, error: null };
  }

  // ---------- 保存 ----------
  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(App.S)); } catch (e) { /* 保存できなくても遊べる */ }
  }
  function loadSaved() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      const s = raw ? JSON.parse(raw) : null;
      return s && s.v === 1 && s.screen && s.screen !== 'title' ? s : null;
    } catch (e) { return null; }
  }
  function clearSaved() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* 何もしない */ }
  }

  // ---------- 共通 ----------
  const humans = () => App.S.bots.map((b, s) => b ? -1 : s).filter(s => s >= 0);
  const multiHuman = () => humans().length > 1;
  // 再生や盤面をだれの目線で見せるか（人間が 1 人ならその人、複数なら公開情報だけ）
  const publicViewer = () => (humans().length === 1 ? humans()[0] : -1);

  // 端末を seat の人に渡す必要があれば目隠し画面を出す
  function handTo(seat, purpose) {
    App.T.modal = null; App.T.logOpen = false;
    if (multiHuman() && App.S.holder !== seat) App.S.gate = { seat, purpose };
    else App.S.holder = seat;
  }

  function commit() {
    save();
    App.render();
    scheduleBots();
  }

  // ---------- タイトル ----------
  function startGame(names, bots) {
    const used = {};
    const clean = names.map((n, i) => {
      let x = String(n || '').trim().slice(0, 10) || `プレイヤー${i + 1}`;
      if (used[x]) x = `${x}${i + 1}`;
      used[x] = true;
      return x;
    });
    App.S = {
      v: 1, screen: 'draft', names: clean, bots: bots.slice(),
      seed: Math.floor(Math.random() * 2 ** 31),
      draft: { pool: Object.keys(App.D.factions), step: 0, picks: [[], [], [], []] },
      holder: null, gate: null,
    };
    App.T = freshTransient();
    commit();
  }

  // ---------- ドラフト ----------
  function draftSeat() { return DRAFT_ORDER[App.S.draft.step]; }

  function takeFaction(f) {
    const dr = App.S.draft;
    if (!dr.pool.includes(f)) return;
    dr.picks[draftSeat()].push(f);
    dr.pool = dr.pool.filter(x => x !== f);
    dr.step++;
    App.T.draftFocus = null;
    if (dr.step >= DRAFT_ORDER.length) beginGame();
  }

  function draftPick(f) {
    takeFaction(f);
    commit();
  }

  function randomFaction() {
    const dr = App.S.draft;
    const rand = E.rng(App.S.seed + dr.step * 101);
    return dr.pool[Math.floor(rand() * dr.pool.length)];
  }

  function botDraftPick() {
    if (!App.S || App.S.screen !== 'draft' || App.S.gate) return;
    draftPick(randomFaction());
  }

  // おまかせ：残りのドラフトを全員ぶん自動で決める
  function autoDraft() {
    clearTimeout(botTimer);
    while (App.S.screen === 'draft' && App.S.draft.step < DRAFT_ORDER.length) takeFaction(randomFaction());
    commit();
  }

  // ---------- 秘密の目標を配る ----------
  function beginGame() {
    const S = App.S;
    S.game = E.setup(App.D, S.draft.picks, S.seed);
    S.screen = 'deal';
    S.deal = { queue: humans() };
    if (S.deal.queue.length) handTo(S.deal.queue[0], 'deal');
    else beginRound();
  }

  function dealDone() {
    const S = App.S;
    S.deal.queue.shift();
    if (S.deal.queue.length) handTo(S.deal.queue[0], 'deal');
    else beginRound();
    commit();
  }

  // ---------- ラウンド：配置 ----------
  function beginRound() {
    const S = App.S, g = S.game;
    const rand = E.rng((S.seed + g.round * 7919) >>> 0);
    const chooser = App.B.makeGreedyChooser(rand);
    const actions = [], botUp = [];
    g.players.forEach((_, s) => {
      if (!S.bots[s]) { actions[s] = null; botUp[s] = false; return; }
      const d = App.B.greedyAction(g, s, rand, chooser);
      actions[s] = d.action; botUp[s] = d.up;
    });
    const order = [];
    for (let k = 0; k < 4; k++) { const s = (g.startPlayer + k) % 4; if (!S.bots[s]) order.push(s); }
    S.plan = { order, idx: 0, actions, botUp };
    S.screen = 'plan';
    resetPlanSelection();
    if (order.length) handTo(order[0], 'plan');
    else goResolve();
  }

  function resetPlanSelection() {
    Object.assign(App.T, { planSel: null, planBase: null, planRefresh: false });
  }

  function planConfirm() {
    const S = App.S, T = App.T, plan = S.plan;
    const seat = plan.order[plan.idx];
    if (T.planRefresh) plan.actions[seat] = { type: 'refresh' };
    else if (T.planSel != null && T.planBase != null) plan.actions[seat] = { type: 'play', uid: T.planSel, bi: T.planBase };
    else return;
    plan.idx++;
    resetPlanSelection();
    if (plan.idx < plan.order.length) handTo(plan.order[plan.idx], 'plan');
    else if (multiHuman()) { S.holder = null; S.gate = { seat: null, purpose: 'reveal' }; T.modal = null; T.logOpen = false; }
    else goResolve();
    commit();
  }

  // ---------- ラウンド：公開と効果の解決 ----------
  function goResolve() {
    const S = App.S;
    S.res = { before: S.game, actions: S.plan.actions, botUp: S.plan.botUp, answers: [], pending: null, mid: null, frames: [], shown: 0, done: null };
    S.plan = null;
    S.screen = 'resolve';
    step();
  }

  function autoAnswerer(res) {
    const S = App.S;
    const rand = E.rng((S.seed + res.before.round * 31 + res.answers.length * 977) >>> 0);
    const chooser = App.B.makeGreedyChooser(rand);
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    return (st, seat, kind, options, info) => {
      if (!S.bots[seat]) return undefined;
      const a = kind === 'faceUp' ? res.botUp[seat] : chooser(st, seat, kind, options, info);
      return options.some(o => same(o, a)) ? a : options[0];
    };
  }

  function step() {
    const S = App.S, res = S.res;
    let r;
    try {
      r = E.resolveRound(App.D, res.before, res.actions, res.answers, autoAnswerer(res), { trace: true });
    } catch (e) {
      App.T.error = `ラウンドの処理でエラーが起きました：${e && e.message ? e.message : e}`;
      res.pending = null;
      return;
    }
    res.answers = r.answers;
    res.frames = r.frames;
    res.pending = r.pending;
    res.mid = r.pending ? r.state : null;
    res.done = r.pending ? null : r.state;
    App.T.pick = null; App.T.pickCard = null;
    afterPlayback();
  }

  // 公開の再生が追いついたら、次の選択（または結果画面）へ進む
  function afterPlayback() {
    const S = App.S, res = S.res;
    if (res.shown < groupCount(res)) return;
    if (res.pending) {
      if (SECRET_KINDS.includes(res.pending.kind)) handTo(res.pending.seat, 'resolve');
      else S.holder = null;
      return;
    }
    S.result = { before: res.before, after: res.done };
    S.game = res.done;
    S.res = null;
    S.holder = null;
    S.screen = 'result';
  }

  function groupCount(res) { return window.UI.groupFrames(res.frames).length; }

  function replay(skip) {
    const res = App.S.res;
    if (!res) return;
    res.shown = skip ? groupCount(res) : res.shown + 1;
    App.T.replayAll = false;
    afterPlayback();
    commit();
  }

  function answer() {
    const S = App.S, T = App.T, p = S.res && S.res.pending;
    if (!p || T.pick == null) return;
    S.res.answers = S.res.answers.concat([p.options[T.pick]]);
    step();
    commit();
  }

  function retryRound() {
    const S = App.S;
    if (!S.res) return;
    S.res.answers = []; S.res.pending = null; S.res.done = null;
    App.T.error = null;
    step();
    commit();
  }

  // ---------- 結果 ----------
  function nextFromResult() {
    const S = App.S;
    S.result = null;
    if (S.game.over) S.screen = 'final';
    else beginRound();
    commit();
  }

  // ---------- ボットの自動操作 ----------
  let botTimer = null;
  function scheduleBots() {
    clearTimeout(botTimer);
    const S = App.S;
    if (!S || S.gate) return;
    if (S.screen === 'draft' && S.bots[draftSeat()]) botTimer = setTimeout(botDraftPick, BOT_DELAY_MS);
  }

  // ---------- 操作 ----------
  function onAction(act, el) {
    const S = App.S, T = App.T;
    const num = k => (el.dataset[k] != null ? Number(el.dataset[k]) : null);
    switch (act) {
      case 'toggle-bot': { const i = num('seat'); T.form.bots[i] = !T.form.bots[i]; break; }
      case 'start':
        if (!window.Tutorial.seen()) { T.tut = 0; T.tutStart = true; break; }
        startGame(T.form.names, T.form.bots); return;
      case 'tut-next': T.tut++; break;
      case 'tut-prev': T.tut = Math.max(0, T.tut - 1); break;
      case 'tut-close': window.Tutorial.markSeen(); T.tut = null; break;
      case 'tut-start': window.Tutorial.markSeen(); T.tut = null; startGame(T.form.names, T.form.bots); return;
      case 'resume': App.S = loadSaved(); App.T = freshTransient(); commit(); return;
      case 'quit':
        if (!window.confirm('ゲームをやめてタイトルに戻りますか？（今のゲームは消えます）')) return;
        clearTimeout(botTimer); clearSaved(); App.S = null; App.T = freshTransient(); break;
      case 'again': { const names = S.names, bots = S.bots; clearSaved(); startGame(names, bots); return; }
      case 'title': clearTimeout(botTimer); clearSaved(); App.S = null; App.T = freshTransient(); break;
      case 'draft-focus': T.draftFocus = T.draftFocus === el.dataset.f ? null : el.dataset.f; break;
      case 'draft-auto': autoDraft(); return;
      case 'draft-pick': if (!S.bots[draftSeat()]) { draftPick(el.dataset.f); return; } break;
      case 'gate-ok': {
        const g = S.gate; S.gate = null;
        S.holder = g.seat;
        if (g.purpose === 'reveal') { goResolve(); }
        commit(); return;
      }
      case 'deal-ok': dealDone(); return;
      case 'hand': {
        const uid = num('uid');
        T.planRefresh = false;
        T.planSel = T.planSel === uid ? null : uid;
        if (T.planSel == null) T.planBase = null;
        break;
      }
      case 'place': T.planBase = num('bi'); break;
      case 'refresh': T.planRefresh = !T.planRefresh; T.planSel = null; T.planBase = null; break;
      case 'plan-ok': planConfirm(); return;
      case 'opt': T.pick = num('i'); break;
      case 'opt-card': T.pickCard = num('uid'); T.pick = null; break;
      case 'answer': answer(); return;
      case 'retry': retryRound(); return;
      case 'replay-next': replay(false); return;
      case 'replay-skip': replay(true); return;
      case 'replay-all': T.replayAll = !T.replayAll; break;
      case 'help': T.tut = 0; T.tutStart = false; break;
      case 'next': nextFromResult(); return;
      case 'card': T.modal = { type: 'card', uid: num('uid'), bi: num('bi') }; break;
      case 'objective': T.modal = { type: 'objective', seat: num('seat') }; break;
      case 'log': T.logOpen = true; break;
      case 'close': T.modal = null; T.logOpen = false; if (T.tut != null) { window.Tutorial.markSeen(); T.tut = null; } break;
      default: return;
    }
    App.render();
  }

  document.addEventListener('click', ev => {
    const el = ev.target.closest('[data-act]');
    if (!el || el.disabled) return;
    if (el.classList.contains('overlay') && ev.target !== el) return; // 中身のタップでは閉じない
    onAction(el.dataset.act, el);
  });
  document.addEventListener('input', ev => {
    const el = ev.target;
    if (el.dataset && el.dataset.name != null && App.T.form) App.T.form.names[Number(el.dataset.name)] = el.value;
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && (App.T.modal || App.T.logOpen || App.T.tut != null)) { App.T.modal = null; App.T.logOpen = false; App.T.tut = null; App.render(); }
  });

  // ---------- 起動 ----------
  async function boot() {
    const root = document.getElementById('app');
    try {
      const res = await fetch('cards.json', { cache: 'no-cache' });
      if (!res.ok) throw new Error(`cards.json を読めませんでした（${res.status}）`);
      App.D = E.indexData(await res.json());
    } catch (e) {
      root.innerHTML = window.Screens.loadError(e && e.message ? e.message : String(e));
      return;
    }
    App.B = window.Bots.createBots(E, App.D);
    App.S = null;
    App.render();
  }

  App.render = function () { window.Screens.render(App); };
  App.draftSeat = draftSeat;
  App.SECRET_KINDS = SECRET_KINDS;
  App.loadSaved = loadSaved;
  App.publicViewer = () => publicViewer();
  App.DRAFT_ORDER = DRAFT_ORDER;

  boot();
})();
