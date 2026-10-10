// 簡易シミュレーター：node game/sim/sim.js [games] [bot]
// bot: greedy（既定） / random / mixed（greedy 2 + random 2）
const fs = require('fs');
const path = require('path');
const E = require('../engine.js');
const D = E.indexData(JSON.parse(fs.readFileSync(path.join(__dirname, '../cards.json'), 'utf8')));
const FACTIONS = Object.keys(D.factions);
const clone = s => JSON.parse(JSON.stringify(s));

// ---------- 評価関数 ----------
function H(state, me) {
  const p = state.players[me];
  let h = p.vp + 0.35 * Math.min(p.hand.length, 6);
  const progressFloor = state.round / E.ROUNDS; // 最終ラウンドに全基地が採点されるので、終盤ほど確実
  state.bases.forEach((b, bi) => {
    if (!b.stacks[me].length) return;
    const bdef = D.bases[b.id];
    const prog = Math.max(Math.min(1, E.baseTotal(D, state, bi) / bdef.bp), progressFloor);
    const r = E.ranking(D, state, bi)[me];
    h += Math.pow(prog, 1.3) * (bdef.vp[r] || 0);
  });
  return h;
}

function strongestTarget(state, opts, valueOf) {
  // 得点の高い持ち主の、値の大きいカードを狙う
  let best = null, bv = -1e9;
  opts.forEach(o => {
    const uid = Array.isArray(o) ? o[0] : o;
    const f = E.findCard(state, uid);
    if (!f) return;
    const v = valueOf(f) + 0.5 * state.players[f.card.owner].vp;
    if (v > bv) { bv = v; best = o; }
  });
  return best;
}

function makeGreedyChooser(rand) {
  return function chooser(state, seat, kind, options, info) {
    const pick = () => options[Math.floor(rand() * options.length)];
    const p = state.players[seat];
    switch (kind) {
      case 'faceUp': return true; // 実際の判断は行動選択時に済ませている（下で上書き）
      case 'discard': {
        let best = options[0], bv = 1e9;
        options.forEach(uid => { const c = p.hand.find(x => x.uid === uid); const v = D.cards[c.cid].value; if (v < bv) { bv = v; best = uid; } });
        return best;
      }
      case 'recover': {
        let best = options[0], bv = -1;
        options.forEach(uid => { const c = p.trash.find(x => x.uid === uid); const v = D.cards[c.cid].value; if (v > bv) { bv = v; best = uid; } });
        return best;
      }
      case 'smoke': return p.hand.length <= 3;
      case 'flipDown': case 'bounce': case 'reveal':
        return strongestTarget(state, options, f => E.cardValue(D, state, f.bi, f.card) * (kind === 'reveal' ? -1 : 1));
      case 'flipUpOwn': return pick();
      case 'terraform': {
        // 自分の順位が一番悪い基地を入れ替える
        let best = options[0], bv = 1e9;
        options.forEach(bi => { const r = E.ranking(D, state, bi)[seat]; const v = r == null ? 1.5 : -r; if (v < bv) { bv = v; best = bi; } });
        return best;
      }
      case 'extraPlayUp': {
        let best = options[0], bv = -1;
        options.forEach(uid => { if (uid == null) return; const c = p.hand.find(x => x.uid === uid); const v = D.cards[c.cid].value + (E.canFaceUp(D, state, info.bi, c) ? 2 : 0); if (v > bv) { bv = v; best = uid; } });
        return best;
      }
      case 'extraPlay': case 'reanimate': case 'move': case 'moveOther': case 'moveSelf': {
        // 盤面に適用して評価
        let best = options[0], bv = -1e9;
        options.forEach(o => {
          const s2 = clone(state);
          applyBoardOption(s2, seat, kind, o, info);
          const v = H(s2, seat) - (kind === 'moveOther' ? H(s2, ownerOf(state, o)) * 0.3 : 0) + rand() * 0.01;
          if (v > bv) { bv = v; best = o; }
        });
        return best;
      }
    }
    return pick();
  };
}
function ownerOf(state, o) { const f = E.findCard(state, o[0]); return f ? f.card.owner : 0; }

function applyBoardOption(s, seat, kind, o, info) {
  const p = s.players[seat];
  if (o == null) return;
  if (kind === 'extraPlay') {
    const i = p.hand.findIndex(h => h.uid === o[0]);
    const h = p.hand.splice(i, 1)[0]; h.faceUp = false; s.bases[o[1]].stacks[seat].push(h);
  } else if (kind === 'reanimate') {
    const i = p.trash.findIndex(h => h.uid === o[0]);
    const h = p.trash.splice(i, 1)[0]; h.faceUp = false; s.bases[o[1]].stacks[seat].push(h);
  } else if (kind === 'move' || kind === 'moveOther') {
    const f = E.findCard(s, o[0]); s.bases[f.bi].stacks[f.s].splice(f.i, 1); s.bases[o[1]].stacks[f.card.owner].push(f.card);
  } else if (kind === 'moveSelf') {
    const f = E.findCard(s, info.uid); if (!f) return; s.bases[f.bi].stacks[f.s].splice(f.i, 1); s.bases[o].stacks[seat].push(f.card);
  }
}

function randomChooser(rand) {
  return (state, seat, kind, options) => options[Math.floor(rand() * options.length)];
}

// 行動選択：自分の配置＋公開だけを仮適用して評価（他人の同時手は読まない）
function greedyAction(state, seat, rand, chooser) {
  const p = state.players[seat];
  let best = { type: 'refresh' }, bestUp = false;
  const sR = clone(state);
  const target = 5;
  const w4 = state.bases.some((b) => b.stacks[seat].some(x => x.faceUp && x.cid === 'w4'));
  let bv = H(sR, seat) + 0.35 * Math.max(0, target - p.hand.length) * 0.9 - 1.2 + (w4 ? 1.5 : 0);
  p.hand.forEach(c => {
    state.bases.forEach((b, bi) => {
      [false, true].forEach(up => {
        if (up && !E.canFaceUp(D, state, bi, c)) return;
        const s2 = clone(state);
        const pl = s2.players[seat];
        const i = pl.hand.findIndex(x => x.uid === c.uid);
        const card = pl.hand.splice(i, 1)[0];
        s2.bases[bi].stacks[seat].push(card);
        if (up) {
          card.faceUp = true;
          E.onReveal({ D, rand, chooser }, s2, card);
        }
        const v = H(s2, seat) + rand() * 0.05;
        if (v > bv) { bv = v; best = { type: 'play', uid: c.uid, bi }; bestUp = up; }
      });
    });
  });
  return { action: best, up: bestUp };
}

// カード別：表向きで公開されたカードを記録
let REVEALED = null;
const _onReveal = E.onReveal;
function trackReveal(card) { if (REVEALED) REVEALED[card.owner].add(card.cid); }

// ---------- 1ゲーム ----------
function playGame(seed, bots) {
  const rand = E.rng(seed * 7919 + 13);
  // ドラフト（スネーク順 1-2-3-4-4-3-2-1）。ボットはランダムに選ぶ
  const pool = E.shuffle(FACTIONS.slice(), rand);
  const picks = [[], [], [], []];
  [0, 1, 2, 3, 3, 2, 1, 0].forEach(s => picks[s].push(pool.shift()));
  const state = E.setup(D, picks, seed);
  const choosers = bots.map(b => b === 'random' ? randomChooser(rand) : makeGreedyChooser(rand));
  const leaders = [];
  REVEALED = [new Set(), new Set(), new Set(), new Set()];
  let midLeader = null;
  while (!state.over) {
    const decided = state.players.map((_, s) => {
      if (bots[s] === 'random') {
        const p = state.players[s];
        if (!p.hand.length || rand() < 0.1) return { action: { type: 'refresh' }, up: false };
        const c = p.hand[Math.floor(rand() * p.hand.length)];
        return { action: { type: 'play', uid: c.uid, bi: Math.floor(rand() * state.bases.length) }, up: rand() < 0.7 };
      }
      return greedyAction(state, s, rand, choosers[s]);
    });
    const ctx = {
      D, rand,
      chooser: (st, seat, kind, options, info) => {
        if (kind === 'faceUp') { if (decided[seat].up && info) { const f = E.findCard(st, info.uid); if (f) trackReveal(f.card); } return decided[seat].up; }
        return choosers[seat](st, seat, kind, options, info);
      },
    };
    const round = state.round;
    E.playRound(ctx, state, decided.map(d => d.action));
    const vps = state.players.map(p => p.vp);
    const top = Math.max(...vps);
    leaders.push(vps.map((v, i) => v === top ? i : -1).filter(i => i >= 0));
    if (round === 4) midLeader = leaders[leaders.length - 1];
    if (round > 50) throw new Error('終わらない');
  }
  let changes = 0;
  for (let i = 1; i < leaders.length; i++) if (leaders[i].join() !== leaders[i - 1].join()) changes++;
  const revealed = REVEALED; REVEALED = null;
  return { state, picks, changes, midLeader, revealed };
}

// ---------- 集計 ----------
const N = +(process.argv[2] || 2000);
const mode = process.argv[3] || 'greedy';
const botsFor = () => mode === 'random' ? ['random', 'random', 'random', 'random']
  : mode === 'mixed' ? ['greedy', 'greedy', 'random', 'random'] : ['greedy', 'greedy', 'greedy', 'greedy'];

const seatWin = [0, 0, 0, 0], facWin = {}, facPlay = {}, objMet = {}, objCnt = {};
const pairWin = {};
const cardStat = {};
let vpSum = 0, vpMax = 0, breaks = 0, fu = 0, fd = 0, ties = 0, changes = 0, midHold = 0, margin = 0;
const vpHist = [];
const t0 = Date.now();
for (let g = 0; g < N; g++) {
  const bots = botsFor();
  // mixed のときは席を回す
  if (mode === 'mixed') for (let k = 0; k < g % 4; k++) bots.unshift(bots.pop());
  const { state, picks, changes: ch, midLeader, revealed } = playGame(g + 1, bots);
  const w = state.winners;
  if (w.length > 1) ties++;
  w.forEach(s => { seatWin[s] += 1 / w.length; });
  state.players.forEach((p, s) => {
    const key = picks[s].slice().sort().join('+');
    pairWin[key] = pairWin[key] || [0, 0];
    pairWin[key][1]++;
    if (w.includes(s)) pairWin[key][0] += 1 / w.length;
    picks[s].forEach(f => {
      facPlay[f] = (facPlay[f] || 0) + 1;
      if (w.includes(s)) facWin[f] = (facWin[f] || 0) + 1 / w.length;
    });
    objCnt[p.objective] = (objCnt[p.objective] || 0) + 1;
    if (p.objectiveMet) objMet[p.objective] = (objMet[p.objective] || 0) + 1;
    vpSum += p.vp; vpMax = Math.max(vpMax, p.vp); vpHist.push(p.vp);
    fu += p.stats.fu; fd += p.stats.fd;
    revealed[s].forEach(cid => { cardStat[cid] = cardStat[cid] || [0, 0]; cardStat[cid][1]++; if (w.includes(s)) cardStat[cid][0] += 1 / w.length; });
  });
  const sorted = state.players.map(p => p.vp).sort((a, b) => b - a);
  margin += sorted[0] - sorted[1];
  breaks += state.breaks;
  changes += ch;
  if (midLeader && midLeader.some(s => w.includes(s))) midHold++;
  if (mode === 'mixed') {
    bots.forEach((b, s) => { if (w.includes(s)) facWin['__' + b] = (facWin['__' + b] || 0) + 1 / w.length; });
  }
}
const pct = x => (100 * x).toFixed(1) + '%';
console.log(`games=${N} bots=${mode} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
console.log('席別勝率:', seatWin.map((x, i) => `P${i + 1} ${pct(x / N)}`).join('  '));
console.log('派閥別勝率（公平値25%）:');
FACTIONS.forEach(f => console.log(`  ${D.factions[f].name.padEnd(8, '　')} ${pct((facWin[f] || 0) / facPlay[f])}`));
const pairs = Object.entries(pairWin).filter(([, v]) => v[1] >= 30).map(([k, v]) => [k, v[0] / v[1], v[1]]).sort((a, b) => b[1] - a[1]);
const nm = k => k.split('+').map(f => D.factions[f].name).join('×');
console.log('組み合わせ 上位3:', pairs.slice(0, 3).map(([k, r, n]) => `${nm(k)} ${pct(r)}(n=${n})`).join(' / '));
console.log('組み合わせ 下位3:', pairs.slice(-3).map(([k, r, n]) => `${nm(k)} ${pct(r)}(n=${n})`).join(' / '));
if (mode === 'mixed') console.log('ボット別勝率: greedy', pct((facWin.__greedy || 0) / (N * 2)), ' random', pct((facWin.__random || 0) / (N * 2)));
console.log(`平均VP ${(vpSum / N / 4).toFixed(1)}  最大VP ${vpMax}  1位と2位の差 平均 ${(margin / N).toFixed(1)}  同点決着 ${pct(ties / N)}`);
console.log(`基地の採点 平均 ${(breaks / N).toFixed(1)} 回/ゲーム（最終採点を含む）`);
console.log(`表向き率 ${pct(fu / (fu + fd))}`);
console.log(`首位交代 平均 ${(changes / N).toFixed(1)} 回/ゲーム   4ラウンド終了時の首位がそのまま勝つ ${pct(midHold / N)}`);
console.log('秘密の目標 達成率:', Object.keys(D.objectives).map(o => `${D.objectives[o].name} ${pct((objMet[o] || 0) / (objCnt[o] || 1))}`).join('  '));

if (process.argv[4] === 'cards') {
  console.log('カード別（表向きで公開したゲームの勝率 / 公開されたゲーム数）:');
  FACTIONS.forEach(f => {
    const row = D.raw.cards.filter(c => c.faction === f).map(c => { const v = cardStat[c.id] || [0, 0]; return `${c.value}${c.name} ${v[1] ? pct(v[0] / v[1]) : '-'}(${v[1]})`; });
    console.log(`  ${D.factions[f].name}: ` + row.join('  '));
  });
}
