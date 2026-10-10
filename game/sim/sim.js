// 簡易シミュレーター：node game/sim/sim.js [games] [bot]
// bot: greedy（既定） / random / mixed（greedy 2 + random 2）
const fs = require('fs');
const path = require('path');
const E = require('../engine.js');
const D = E.indexData(JSON.parse(fs.readFileSync(path.join(__dirname, '../cards.json'), 'utf8')));
const FACTIONS = Object.keys(D.factions);

const { makeGreedyChooser, randomChooser, greedyAction } = require('../bots.js').createBots(E, D);

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
