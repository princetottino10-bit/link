import { WORDS } from './words.js';
import {
  ROWS, COLS, MAX_LIVES, idx, toHira, baseKana, variants, mineLetters, buildPool, buildCells,
  mulberry32, shuffled, DAY0, jstDay, dayLabel, checkAnswerShape, judgeGuess, knowledge,
  floodOpen, titleFor, bucketFor, SHARE_MARK
} from './rules.js';
import { loadStats, recordResult, loadName, saveName } from './stats.js';
import { submitScore, fetchStanding, RankingError } from './ranking.js';
import { renderStats, renderRanking } from './panels.js';
import { shake, flash, vibrate, confetti } from './effects.js';

// 置き場所が変わっても壊れないよう、シェア URL は今開いているページから作る
const URL_SELF = /^https?:$/.test(location.protocol)
  ? location.origin + location.pathname.replace(/index\.html$/, '')
  : 'https://princetottino10-bit.github.io/link/gojuon-mines/';

const POOL = buildPool(WORDS);
const DAILY_ORDER = shuffled(POOL, mulberry32(50));
// むずいは、ふつうとは別の言葉（順番を半周ずらす）。同じだと、ふつうで解いた人が答えを知ってしまう
const dailyPick = (day, lv = 'normal') => {
  const n = DAILY_ORDER.length;
  const k = day - DAY0 + (lv === 'hard' ? Math.floor(n / 2) : 0);
  return DAILY_ORDER[(k % n + n) % n];
};

// ---------- storage (best effort) ----------
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

// ---------- state ----------
const $ = id => document.getElementById(id);
let mode = 'daily';
let level = 'normal';
let S = null;      // current game
let cells = [];
let flagMode = false;
let gameId = 0;
let popCells = new Set();  // 次の描画で弾ませるマス
let newGuess = false;  // 次の描画でめくる答えの行

const freshState = (pick, day, lv) => ({
  word: pick.w, genre: pick.genre, day, level: lv,
  open: [], flags: [], booms: [], guesses: [], opens: [],
  lives: MAX_LIVES, moves: 0, misses: 0, done: false, won: false, recorded: false, submitted: false
});
// 古い版で保存したゲームにも新しい項目をそろえる
const normalize = g => ({ ...freshState({ w: g.word, genre: g.genre }, g.day, 'normal'), ...g });
const hardSuffix = lv => lv === 'hard' ? ':hard' : '';
const keyOf = (m, g) => m === 'daily'
  ? `gojuon-mines:${g.day}${hardSuffix(g.level)}`
  : `gojuon-mines:free${hardSuffix(g.level)}`;
const save = () => store.set(keyOf(mode, S), S);

// fresh: フリープレイで保存中のゲームを捨てて新しいお題にする
function newGame(m, fresh = false) {
  mode = m;
  gameId++;
  closeModal($('modal'));
  const day = jstDay();
  const probe = { day, level };
  if (m === 'daily') {
    // 保存があればそれを優先する（単語リストを変えても、その日の途中経過は消えない）
    const saved = store.get(keyOf('daily', probe));
    S = saved && saved.word ? normalize(saved) : freshState(dailyPick(day, level), day, level);
  } else {
    const saved = fresh ? null : store.get(keyOf('free', probe));
    if (saved && saved.word && !saved.done) {
      S = normalize(saved);
    } else {
      // 今日のお題（ふつう・むずい）と直前のお題は避ける
      const avoid = new Set([dailyPick(day).w, dailyPick(day, 'hard').w, S && S.word]);
      const choices = POOL.filter(p => !avoid.has(p.w));
      S = freshState(choices[Math.floor(Math.random() * choices.length)], day, level);
    }
  }
  S.level = level;
  cells = buildCells(S.word);
  $('answer').value = '';
  if (!S.done) setMessage(level === 'hard' ? 'むずい：マスは1つずつしか開きません' : 'マスを開けて、地雷の文字をさがそう');
  else setMessage(mode === 'daily' ? '今日のお題はおわり。「結果を見る」からシェアできます' : '');
  save();
  render();
}

// ---------- actions ----------
function openCell(i) {
  const cell = cells[i];
  if (S.done || !cell.kana || S.open.includes(i) || S.booms.includes(i) || S.flags.includes(i)) return;
  if (knowledge(cells, S).mines.has(i)) return setMessage(`「${cell.kana}」は地雷の文字だと分かっています`);
  const first = S.moves === 0;
  S.moves++;
  popCells = new Set([i]);
  if (cell.mine) {
    S.booms.push(i);
    S.opens.push('b');
    if (first) {
      setMessage(`1手目はセーフ！「${cell.kana}」は地雷の文字です`);
    } else {
      S.lives--;
      setMessage(`ドカン！「${cell.kana}」は地雷の文字。ライフ -1`);
      shake($('board'));
      flash();
      vibrate([40, 40, 80]);
      if (S.lives <= 0) return finish(false);
    }
  } else {
    // ふつうは 0 のマスから連鎖して開く。むずいはこの1マスだけ
    const opened = S.level === 'hard' ? [i] : floodOpen(cells, i, S.open);
    S.open.push(...opened);
    S.flags = S.flags.filter(f => !opened.includes(f));
    S.opens.push(cell.n === 0 ? 'z' : 's');
    popCells = new Set(opened);
    if (cell.n !== 0) setMessage('');
    else if (S.level === 'hard') setMessage(`「${cell.kana}」の周りに地雷なし。周りのマスは安全です`);
    else setMessage(`「${cell.kana}」から${opened.length}マス開いた！`);
  }
  save();
  render();
}

function toggleFlag(i) {
  if (S.done || !cells[i].kana || S.open.includes(i) || S.booms.includes(i)) return;
  const f = S.flags.indexOf(i);
  if (f >= 0) S.flags.splice(f, 1); else S.flags.push(i);
  save();
  render();
}

function submitAnswer() {
  if (S.done) return;
  const v = toHira($('answer').value).replace(/[\s　]/g, '');
  if (!v) return;
  // 文字数違い・ひらがな以外・同じ答えは打ちまちがいとみなし、手数もライフも減らさない
  const shape = checkAnswerShape(v, S.word);
  if (!shape.ok) {
    shake($('answerRow'));
    return setMessage(shape.reason === 'kana'
      ? 'ひらがなで答えてね（ライフは減りません）'
      : `答えは${[...S.word].length}文字です（ライフは減りません）`);
  }
  if (S.guesses.some(g => g.text === v)) return setMessage('その答えはもう試しました');
  S.moves++;
  S.guesses.push({ text: v, marks: judgeGuess(v, S.word) });
  newGuess = true;
  if (v === S.word) return finish(true);
  S.lives--;
  S.misses++;
  $('answer').value = '';
  shake($('answerRow'));
  vibrate(30);
  setMessage(`「${v}」じゃないみたい… ライフ -1（色のヒントを見てみよう）`);
  if (S.lives <= 0) return finish(false);
  save();
  render();
}

function finish(won) {
  S.done = true;
  S.won = won;
  if (!S.recorded) {
    recordResult({ level: S.level, mode, day: S.day, won, moves: S.moves, genre: S.genre });
    S.recorded = true;
  }
  save();
  render();
  setMessage(won ? `正解！ ${S.moves}手で「${titleFor(S.moves)}」` : `ざんねん… 正解は「${S.word}」`);
  if (won) { confetti(); vibrate([20, 30, 20, 30, 60]); }
  const id = gameId;
  setTimeout(() => { if (id === gameId) showResult(); }, 900);
}

// ---------- render ----------
const boardEl = $('board');
const cellEls = [];

function buildBoard() {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const i = idx(c, r);
    const b = document.createElement('button');
    b.className = 'cell';
    b.dataset.i = i;
    boardEl.appendChild(b);
    cellEls[i] = b;
  }
}

function cellView(cell, i, know) {
  const isOpen = S.open.includes(i), isBoom = S.booms.includes(i), isFlag = S.flags.includes(i);
  if (isOpen) {
    return {
      cls: 'open',
      html: `<span class="kana">${cell.kana}</span>` + (cell.n ? `<span class="num n${cell.n}">${cell.n}</span>` : ''),
      label: `${cell.kana} 開いた 周りの地雷${cell.n}`
    };
  }
  if (isBoom || (S.done && cell.mine)) return { cls: 'mine' + (isBoom ? ' boom' : ''), label: `${cell.kana} 地雷` };
  if (know.mines.has(i)) return { cls: 'mine known', label: `${cell.kana} 地雷の文字（答えのヒント）` };
  if (isFlag) return { cls: 'flag' + (S.done && !cell.mine ? ' wrong-flag' : ''), label: `${cell.kana} 旗` };
  if (know.safe.has(i)) return { cls: 'safe', label: `${cell.kana} 安全` };
  return { cls: '', label: cell.kana };
}

function renderBoard(know) {
  cells.forEach((cell, i) => {
    const el = cellEls[i];
    if (!cell.kana) {
      el.className = 'cell blank';
      el.textContent = '';
      el.tabIndex = -1;
      el.setAttribute('aria-hidden', 'true');
      return;
    }
    const v = cellView(cell, i, know);
    el.className = 'cell' + (v.cls ? ' ' + v.cls : '') + (popCells.has(i) ? ' pop' : '');
    el.innerHTML = v.html || cell.kana;
    el.setAttribute('aria-label', v.label);
  });
  popCells = new Set();
}

function renderChips(know) {
  // 見つけた文字：確定（踏んだ・答えで分かった）→ 旗（候補）の順
  const chips = $('chips');
  chips.replaceChildren();
  const sure = [...new Set([...S.booms, ...know.mines])];
  const list = [...sure.map(i => ({ k: cells[i].kana, sure: true })),
                ...S.flags.filter(i => !know.mines.has(i)).map(i => ({ k: cells[i].kana, sure: false }))];
  if (!list.length) chips.innerHTML = '<span class="empty">旗を立てた文字がここに並びます</span>';
  for (const { k, sure: isSure } of list) {
    const b = document.createElement('button');
    b.className = 'chip' + (isSure ? ' sure' : '');
    b.textContent = k;
    b.disabled = S.done;
    b.addEventListener('click', () => { $('answer').value += k; });
    chips.appendChild(b);
  }
}

function renderGuesses() {
  const root = $('guesses');
  root.replaceChildren();
  S.guesses.forEach(({ text, marks }, n) => {
    const row = document.createElement('div');
    row.className = 'guess-row' + (newGuess && n === S.guesses.length - 1 ? ' new' : '');
    [...text].forEach((ch, k) => {
      const t = document.createElement('span');
      t.className = `tile ${marks[k]}`;
      t.textContent = ch;
      t.style.setProperty('--d', `${k * 0.09}s`);
      row.appendChild(t);
    });
    root.appendChild(row);
  });
  $('legend').hidden = !S.guesses.length;
  newGuess = false;
}

function render() {
  const know = knowledge(cells, S);
  renderBoard(know);
  renderChips(know);
  renderGuesses();

  $('tabDaily').classList.toggle('active', mode === 'daily');
  $('tabFree').classList.toggle('active', mode === 'free');
  $('tabDaily').setAttribute('aria-selected', mode === 'daily');
  $('tabFree').setAttribute('aria-selected', mode === 'free');
  for (const [id, lv] of [['lvNormal', 'normal'], ['lvHard', 'hard']]) {
    $(id).classList.toggle('active', level === lv);
    $(id).setAttribute('aria-checked', level === lv);
  }
  $('genre').textContent = S.genre;
  $('genre').classList.toggle('small', S.genre.length > 4);
  $('len').textContent = `${[...S.word].length}文字`;
  $('mineCount').textContent = `${mineLetters(S.word).length}個`;
  $('moves').textContent = `${S.moves}手`;
  $('lives').textContent = hearts();

  for (const id of ['answer', 'submit', 'kDaku', 'kBack', 'kClear', 'giveUp']) $(id).disabled = S.done;
  $('giveUp').hidden = S.done;
  $('next').hidden = mode !== 'free' || !S.done;
  $('showResult').hidden = !S.done;
  $('flagMode').classList.toggle('on', flagMode);
  $('flagMode').setAttribute('aria-pressed', flagMode);
}

const hearts = (g = S) => '❤️'.repeat(Math.max(g.lives, 0)) + '🤍'.repeat(MAX_LIVES - Math.max(g.lives, 0));

function setMessage(t) { $('message').textContent = t; }

// ---------- result / share ----------
const OPEN_MARK = { z: '⬜', s: '🟦', b: '💥' };

// 答えが分かる情報（文字や盤面の位置）は入れない
function shareText() {
  const lv = S.level === 'hard' ? '🔥むずい ' : '';
  const title = mode === 'daily'
    ? `${lv}#${S.day - DAY0 + 1}（${dayLabel(S.day)}のお題）`
    : `${lv}フリープレイ（${S.genre}）`;
  const head = S.won ? `${titleFor(S.moves)}　${S.moves}手 ${hearts()}` : '💥 ざんねん…';
  const opens = S.opens.length ? `🔍${S.opens.map(o => OPEN_MARK[o]).join('')}` : '🔍なし';
  const guesses = S.guesses.map(g => g.marks.map(m => SHARE_MARK[m]).join('')).join('\n');
  return `五十音マインスイーパ ${title}\n${head}\n${opens}\n${guesses}\n${URL_SELF}`;
}

function showResult() {
  const opened = S.opens.length, answered = S.guesses.length;
  $('modalHead').textContent = S.won ? '🎉 正解！' : '💥 ゲームオーバー';
  $('modalBadge').textContent = S.won ? `🏅 ${titleFor(S.moves)}` : '';
  $('modalWord').textContent = S.word;
  $('modalGenre').textContent = `ジャンル：${S.genre}`;
  $('modalStats').innerHTML = `手数 <b>${S.moves}</b>（開けた ${opened}・答えた ${answered}）<br>ライフ ${hearts()}`
    + (mode === 'daily' ? '<br><small style="color:var(--muted)">次のお題は明日0時（日本時間）</small>' : '');
  renderRankBox();
  openModal($('modal'), $('closeModal'));
}

// ---------- ranking ----------
// ランキングは、むずいモードの今日のお題だけ
function renderRankBox() {
  const daily = mode === 'daily';
  $('rankBox').hidden = !daily;
  if (!daily) return;
  if (S.level !== 'hard') {
    $('rankForm').hidden = true;
    $('rankNote').textContent = '🔥むずいモードなら、今日のお題のランキングに参加できます';
    return;
  }
  $('rankForm').hidden = S.submitted;
  if (submitting) return; // 登録中は入力や表示を巻き戻さない
  if (!$('rankName').value) $('rankName').value = loadName();
  $('rankSubmit').disabled = false;
  $('rankNote').textContent = '';
  if (S.submitted) showStanding(S);
}

async function showStanding(game) {
  $('rankNote').textContent = '順位を読み込み中…';
  try {
    const st = await fetchStanding(game.day, { moves: game.moves, lives: Math.max(game.lives, 0), won: game.won });
    if (game !== S) return;
    $('rankNote').textContent = game.won ? `🏆 今日の ${st.rank}位 / ${st.total}人中` : `今日の参加者 ${st.total}人`;
  } catch (e) {
    if (game === S) $('rankNote').textContent = e instanceof RankingError ? e.message : '順位を読み込めませんでした';
  }
}

let submitting = false;
async function onRankSubmit(e) {
  e.preventDefault();
  if (submitting) return;
  const game = S, gameMode = mode;
  // 制御文字と、見えない文字・向きを変える文字は消す（なりすましや表示崩れ防止）
  const name = $('rankName').value
    .replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁩﻿]/g, '').trim();
  if (!name) return void ($('rankNote').textContent = 'なまえを入れてね');
  saveName(name);
  submitting = true;
  $('rankSubmit').disabled = true;
  $('rankNote').textContent = '登録中…';
  try {
    await submitScore({
      day: game.day, name: [...name].slice(0, 12).join(''),
      moves: Math.max(game.moves, 1), lives: Math.max(game.lives, 0), won: game.won
    });
    game.submitted = true;
    store.set(keyOf(gameMode, game), game);
    if (game !== S) return;
    $('rankForm').hidden = true;
    showStanding(game);
  } catch (err) {
    $('rankSubmit').disabled = false;
    $('rankNote').textContent = err instanceof RankingError ? err.message : 'ランキングに登録できませんでした';
  } finally {
    submitting = false;
  }
}

// ---------- 成績・ランキングのモーダル ----------
let infoTab = 'stats';
function showInfo(tab) {
  infoTab = tab;
  $('tabStats').classList.toggle('active', tab === 'stats');
  $('tabRanking').classList.toggle('active', tab === 'ranking');
  $('tabStats').setAttribute('aria-selected', tab === 'stats');
  $('tabRanking').setAttribute('aria-selected', tab === 'ranking');
  const today = jstDay();
  if (tab === 'stats') {
    const daily = store.get(keyOf('daily', { day: today, level }));
    const highlight = daily && daily.done && daily.won ? bucketFor(daily.moves) : null;
    renderStats($('infoBody'), loadStats(level), today, highlight, level);
  } else {
    renderRanking($('infoBody'), today);
  }
  if (!$('infoModal').classList.contains('show')) openModal($('infoModal'), $('closeInfo'));
}

// ---------- modals ----------
let lastFocus = null;
const openModals = () => [...document.querySelectorAll('.modal.show')];

function openModal(modal, focusEl) {
  if (!openModals().length) lastFocus = document.activeElement;
  modal.classList.add('show');
  focusEl.focus();
}

function closeModal(modal) {
  if (!modal.classList.contains('show')) return;
  modal.classList.remove('show');
  if (openModals().length) return;
  if (lastFocus && document.contains(lastFocus) && !lastFocus.disabled) lastFocus.focus();
  lastFocus = null;
}

let toastTimer;
function toast(t) {
  const el = $('toast');
  el.textContent = t;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

// ---------- events ----------
let pressTimer = null, longPressed = false;
boardEl.addEventListener('pointerdown', e => {
  const el = e.target.closest('.cell');
  if (!el) return;
  longPressed = false;
  clearTimeout(pressTimer);
  if (e.pointerType === 'mouse') return;
  pressTimer = setTimeout(() => {
    longPressed = true;
    toggleFlag(+el.dataset.i);
    vibrate(20);
  }, 420);
});
for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) {
  boardEl.addEventListener(ev, () => clearTimeout(pressTimer));
}
boardEl.addEventListener('click', e => {
  const el = e.target.closest('.cell');
  if (!el || longPressed) { longPressed = false; return; }
  const i = +el.dataset.i;
  if (flagMode) toggleFlag(i); else openCell(i);
});
boardEl.addEventListener('contextmenu', e => {
  const el = e.target.closest('.cell');
  if (!el) return;
  e.preventDefault();
  if (!longPressed) toggleFlag(+el.dataset.i);
});
boardEl.addEventListener('keydown', e => {
  const el = e.target.closest('.cell');
  if (!el || e.key.toLowerCase() !== 'f' || e.ctrlKey || e.metaKey || e.altKey) return;
  e.preventDefault();
  toggleFlag(+el.dataset.i);
});

$('flagMode').addEventListener('click', () => { flagMode = !flagMode; render(); });
$('submit').addEventListener('click', submitAnswer);
$('answer').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) submitAnswer(); });
$('kBack').addEventListener('click', () => { $('answer').value = [...$('answer').value].slice(0, -1).join(''); });
$('kClear').addEventListener('click', () => { $('answer').value = ''; });
$('kDaku').addEventListener('click', () => {
  const chars = [...toHira($('answer').value)];
  if (!chars.length) return;
  const last = chars.pop();
  const list = variants(baseKana(last));
  const pos = list.indexOf(last);
  chars.push(list[(pos + 1) % list.length]);
  $('answer').value = chars.join('');
});
$('giveUp').addEventListener('click', () => {
  if (!S.done && confirm('あきらめて答えを見ますか？')) { S.lives = 0; finish(false); }
});
$('next').addEventListener('click', () => newGame('free', true));
$('showResult').addEventListener('click', showResult);
$('tabDaily').addEventListener('click', () => mode !== 'daily' && newGame('daily'));
$('tabFree').addEventListener('click', () => mode !== 'free' && newGame('free'));
function setLevel(lv) {
  if (lv === level) return;
  level = lv;
  store.set('gojuon-mines:level', lv);
  newGame(mode);
  toast(lv === 'hard' ? '🔥むずい：1マスずつ・ランキングあり' : 'ふつう：0 のマスから連鎖して開きます');
}
$('lvNormal').addEventListener('click', () => setLevel('normal'));
$('lvHard').addEventListener('click', () => setLevel('hard'));
$('openStats').addEventListener('click', () => showInfo('stats'));
$('openRanking').addEventListener('click', () => showInfo('ranking'));
$('tabStats').addEventListener('click', () => infoTab !== 'stats' && showInfo('stats'));
$('tabRanking').addEventListener('click', () => infoTab !== 'ranking' && showInfo('ranking'));
$('rankForm').addEventListener('submit', onRankSubmit);

$('closeModal').addEventListener('click', () => closeModal($('modal')));
$('closeInfo').addEventListener('click', () => closeModal($('infoModal')));
for (const m of document.querySelectorAll('.modal')) {
  m.addEventListener('click', e => { if (e.target === m) closeModal(m); });
}
document.addEventListener('keydown', e => {
  const top = openModals().pop();
  if (!top) return;
  if (e.key === 'Escape') return closeModal(top);
  if (e.key !== 'Tab') return;
  // モーダルの中だけでフォーカスを回す
  const items = [...top.querySelectorAll('button, input')].filter(x => !x.disabled && x.offsetParent);
  if (!items.length) return e.preventDefault();
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

// 開きっぱなしで日付をまたいだら、手をつけていないか終わっているときだけ新しいお題に切り替える
document.addEventListener('visibilitychange', () => {
  if (document.hidden || mode !== 'daily' || jstDay() === S.day) return;
  if (S.done || !S.moves) {
    newGame('daily');
    toast('日付が変わったので新しいお題です');
  } else {
    setMessage('日付が変わりました。このお題を終えたら再読み込みで新しいお題に');
  }
});

$('shareX').addEventListener('click', () => {
  window.open('https://x.com/intent/post?text=' + encodeURIComponent(shareText()), '_blank', 'noopener');
});
$('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(shareText()); toast('コピーしました'); }
  catch { toast('コピーできませんでした'); }
});

// 30日より前の今日のお題の記録は消す
try {
  const old = jstDay() - 30;
  for (let n = localStorage.length - 1; n >= 0; n--) {
    const m = /^gojuon-mines:(\d+)(:hard)?$/.exec(localStorage.key(n));
    if (m && +m[1] < old) localStorage.removeItem(m[0]);
  }
} catch {}

level = store.get('gojuon-mines:level') === 'hard' ? 'hard' : 'normal';
buildBoard();
if (!store.get('gojuon-mines:seen-rules')) {
  $('rules').open = true;
  store.set('gojuon-mines:seen-rules', true);
}
newGame('daily');
