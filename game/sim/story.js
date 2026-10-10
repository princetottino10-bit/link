// 読むボット 4 体の試合記録を出す（プレイ例づくり用）
//   node game/sim/story.js find   … 逆転が起きた接戦のシードを探す
//   node game/sim/story.js 15     … シード 15 の試合をラウンドごとに出す
const E = require('../engine.js');
const D = E.indexData(require('../cards.json'));
const B = require('../bots.js').createBots(E, D);
const F = Object.keys(D.factions);
function play(seed, record) {
  const rand = E.rng(seed * 7919 + 13);
  const pool = E.shuffle(F.slice(), rand); const picks = [[], [], [], []];
  [0, 1, 2, 3, 3, 2, 1, 0].forEach(s => picks[s].push(pool.shift()));
  let st = E.setup(D, picks, seed);
  const rounds = [];
  while (!st.over) {
    const ch = B.makeGreedyChooser(rand);
    const dec = st.players.map((_, s) => B.readerAction(st, s, rand, ch));
    const auto = (x, seat, kind, o, info) => kind === 'faceUp' ? (info.uid in dec[seat].ups ? dec[seat].ups[info.uid] : dec[seat].up) : ch(x, seat, kind, o, info);
    const before = st;
    const r = E.resolveRound(D, st, dec.map(d => d.action), [], auto);
    rounds.push({ before, after: r.state, actions: dec.map(d => d.action) });
    st = r.state;
  }
  return { picks, rounds, st };
}
const mode = process.argv[2];
if (mode === 'find') {
  const out = [];
  for (let seed = 1; seed <= 60; seed++) {
    const { rounds, st } = play(seed);
    const leaders = rounds.map(r => { const v = r.after.players.map(p => p.vp); const t = Math.max(...v); return v.map((x, i) => x === t ? i : -1).filter(i => i >= 0).join(); });
    let ch = 0; for (let i = 1; i < leaders.length; i++) if (leaders[i] !== leaders[i - 1]) ch++;
    const before8 = rounds[7].before.players.map(p => p.vp); const t7 = Math.max(...before8);
    const comeback = !st.winners.some(w => before8[w] === t7);
    const obj = st.players.filter(p => p.objectiveMet).length;
    const sorted = st.players.map(p => p.vp).sort((a, b) => b - a);
    const w4 = rounds.some(r => r.after.log.some(l => l.includes('知識の泉 を表')));
    out.push({ seed, ch, comeback, margin: sorted[0] - sorted[1], obj, w4, ties: st.winners.length });
  }
  out.filter(o => o.comeback && o.margin <= 3 && o.ties === 1).sort((a, b) => b.ch - a.ch).slice(0, 8).forEach(o => console.log(JSON.stringify(o)));
} else {
  const seed = Number(mode);
  const { picks, rounds, st } = play(seed);
  const nm = s => ['A', 'B', 'C', 'D'][s];
  console.log('factions', picks.map((p, s) => nm(s) + ':' + p.map(f => D.factions[f].name).join('×')).join('  '));
  console.log('objectives', st.players.map((p, s) => nm(s) + ':' + D.objectives[p.objective].name + (p.objectiveMet ? '✓' : '✗')).join(' '));
  rounds.forEach((r, i) => {
    const b = r.before;
    console.log(`\n=== R${b.round} start=${nm(b.startPlayer)} VP ${b.players.map(p => p.vp).join('/')}`);
    b.bases.forEach((base, bi) => console.log(`  [${bi}] ${D.bases[base.id].name} ${E.baseTotal(D, b, bi)}/${E.baseBP(D, b, bi)} tags=${D.bases[base.id].tags.map(t => D.factions[t].name)} cols=${E.totals(D, b, bi).join(',')}`));
    b.players.forEach((p, s) => console.log(`  ${nm(s)} hand: ${p.hand.map(c => D.cards[c.cid].value + D.cards[c.cid].name).join(' ')}`));
    r.actions.forEach((a, s) => console.log(`  ${nm(s)} act: ` + (a.type === 'refresh' ? 'refresh' : E.playsOf(a).map(pl => { const c = b.players[s].hand.find(x => x.uid === pl.uid); return D.cards[c.cid].name + '→' + D.bases[b.bases[pl.bi].id].name; }).join(', '))));
    r.after.log.slice(b.log.length).forEach(l => console.log('    ' + l));
    console.log(`  end VP ${r.after.players.map(p => p.vp).join('/')}`);
  });
  console.log('\nfinal', st.players.map((p, s) => nm(s) + p.vp).join(' '), 'winners', st.winners.map(nm));
}
