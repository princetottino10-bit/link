import { LONG_WORDS } from './long-words.js';
import {
  ROWS, COLS, MAX_LIVES, idx, toHira, baseKana, variants, buildCells, floodOpen, checkAnswerShape,
  judgeGuess, knowledge, pickWords, formatTime, SHARE_MARK, MATCH_SIZE, HINT_PENALTY_MS
} from './rules.js';
import { loadStats, recordPractice, recordMatch, loadName, saveName } from './stats.js';
import { submitScore, fetchMyStanding, RankingError } from './ranking.js';
import { renderStats, renderRanking } from './panels.js';
import { shake, flash, vibrate, confetti } from './effects.js';

// 置き場所が変わっても壊れないよう、シェア URL は今開いているページから作る
const URL_SELF = /^https?:$/.test(location.protocol)
  ? location.origin + location.pathname.replace(/index\.html$/, '')
  : 'https://princetottino10-bit.github.io/link/gojuon-mines/';

const KEY = {
  mode: 'gojuon-mines:mode', practice: 'gojuon-mines:practice',
  match: 'gojuon-mines:match', recent: 'gojuon-mines:recent'
};
const RECENT_MAX = 60;
const NEXT_DELAY_MS = 900; // 1問解いてから次の問題までの演出。タイムには入れない

// ---------- storage (best effort) ----------
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

// ---------- state ----------
const $ = id => document.getElementById(id);
let mode = 'practice';
let S = null;      // いまの問題
let M = null;      // ランクマッチ（3問ぶん）。練習中は null
let cells = [];
let flagMode = false;
let gameId = 0;
let popCells = new Set();  // 次の描画で弾ませるマス
let newGuess = false;      // 次の描画でめくる答えの行
let timerHandle = null;

const GENRE_OF = new Map(LONG_WORDS.map(([w, , g]) => [w, g]));
const freshPuzzle = ([word, kanji, genre]) => ({
  word, kanji, genre: genre || GENRE_OF.get(word) || '', open: [], flags: [], booms: [], guesses: [], opens: [],
  lives: MAX_LIVES, moves: 0, done: false, won: false, hinted: false
});
const EMPTY = { ...freshPuzzle(['', '', '']), done: true };

const rememberWords = words => store.set(KEY.recent, [...(store.get(KEY.recent) || []), ...words].slice(-RECENT_MAX));
const pickFresh = n => {
  const picked = pickWords(LONG_WORDS, n, new Set(store.get(KEY.recent) || []));
  rememberWords(picked.map(x => x[0]));
  return picked;
};

const elapsed = m => (m.endedAt || Date.now()) - m.startedAt + m.penaltyMs;
const totalMoves = m => m.puzzles.reduce((a, p) => a + p.moves, 0);
const coverShown = () => mode === 'ranked' && (!M || M.done);

function save() {
  if (mode === 'practice') store.set(KEY.practice, S);
  else if (M) store.set(KEY.match, M);
}

// ---------- modes ----------
function enterPractice(fresh = false) {
  mode = 'practice';
  store.set(KEY.mode, mode);
  M = null;
  stopTimer();
  const saved = fresh ? null : store.get(KEY.practice);
  S = saved && saved.word && !saved.done
    ? { ...freshPuzzle([saved.word, saved.kanji, saved.genre]), ...saved }
    : freshPuzzle(pickFresh(1)[0]);
  save();
  loadPuzzle('マスを開けて、地雷の文字をさがそう');
}

function enterRanked() {
  mode = 'ranked';
  store.set(KEY.mode, mode);
  const saved = store.get(KEY.match);
  M = saved && saved.puzzles ? saved : null;
  if (M && !M.done) {
    // 解いた直後に閉じた場合は、次の問題から
    if (M.puzzles[M.index].won && M.index < MATCH_SIZE - 1) M.index++;
    M.puzzles = M.puzzles.map(p => ({ ...freshPuzzle([p.word, p.kanji, p.genre]), ...p }));
    S = M.puzzles[M.index];
    loadPuzzle(`${M.index + 1}問目の続きから（タイムは進んでいます）`);
    startTimer();
  } else {
    S = M ? M.puzzles[M.index] : EMPTY;
    stopTimer();
    loadPuzzle('');
  }
}

function startMatch() {
  const puzzles = pickFresh(MATCH_SIZE).map(freshPuzzle);
  M = {
    puzzles, index: 0, startedAt: Date.now(), endedAt: null, penaltyMs: 0,
    done: false, cleared: false, newBest: false, submitted: false
  };
  S = puzzles[0];
  save();
  loadPuzzle('1問目スタート！');
  startTimer();
}

function loadPuzzle(msg) {
  gameId++;
  closeModal($('modal'));
  cells = buildCells(S.word);
  $('answer').value = '';
  setMessage(msg);
  render();
}

// ---------- timer ----------
function tick() { $('timer').textContent = M ? formatTime(elapsed(M)) : '-'; }
function startTimer() {
  stopTimer();
  timerHandle = setInterval(tick, 100);
  tick();
  render();
}
function stopTimer() {
  clearInterval(timerHandle);
  timerHandle = null;
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
      if (S.lives <= 0) return finishPuzzle(false);
    }
  } else {
    const opened = floodOpen(cells, i, S.open);
    S.open.push(...opened);
    S.flags = S.flags.filter(f => !opened.includes(f));
    S.opens.push(cell.n === 0 ? 'z' : 's');
    popCells = new Set(opened);
    setMessage(opened.length > 1 ? `${opened.length}マス開いた！` : '');
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
  if (v === S.word) return finishPuzzle(true);
  S.lives--;
  $('answer').value = '';
  shake($('answerRow'));
  vibrate(30);
  setMessage(`「${v}」じゃないみたい… ライフ -1（色のヒントを見てみよう）`);
  if (S.lives <= 0) return finishPuzzle(false);
  save();
  render();
}

function useHint() {
  if (S.done || S.hinted) return;
  S.hinted = true;
  if (mode === 'ranked') {
    M.penaltyMs += HINT_PENALTY_MS;
    toast('漢字ヒント +30秒');
  }
  save();
  render();
}

function finishPuzzle(won) {
  S.done = true;
  S.won = won;
  const id = gameId;
  if (mode === 'practice') {
    recordPractice({ won, moves: S.moves });
    save();
    render();
    setMessage(won ? `正解！ ${S.moves}手` : `ざんねん… 正解は「${S.word}」（${S.kanji}）`);
    if (won) { confetti(); vibrate([20, 30, 20, 30, 60]); }
    setTimeout(() => { if (id === gameId) showResult(); }, 900);
    return;
  }
  if (won && M.index < MATCH_SIZE - 1) {
    M.penaltyMs -= NEXT_DELAY_MS;
    save();
    render();
    setMessage(`${M.index + 1}問目クリア！「${S.word}」（${S.kanji}）`);
    confetti(40);
    vibrate([20, 30, 20]);
    setTimeout(() => {
      if (id !== gameId) return;
      M.index++;
      S = M.puzzles[M.index];
      save();
      loadPuzzle(`${M.index + 1}問目！`);
    }, NEXT_DELAY_MS);
    return;
  }
  M.done = true;
  M.cleared = won;
  M.endedAt = Date.now();
  stopTimer();
  M.newBest = recordMatch({ cleared: won, timeMs: elapsed(M), moves: totalMoves(M) }).newBest;
  save();
  render();
  setMessage(won ? `3問クリア！ ${formatTime(elapsed(M))}` : `ざんねん… 正解は「${S.word}」（${S.kanji}）`);
  if (won) { confetti(); vibrate([20, 30, 20, 30, 60]); }
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
      t.style.setProperty('--d', `${k * 0.07}s`);
      row.appendChild(t);
    });
    root.appendChild(row);
  });
  $('legend').hidden = !S.guesses.length;
  newGuess = false;
}

function renderHint() {
  $('hintText').hidden = !S.hinted;
  if (!S.hinted) return;
  const small = document.createElement('small');
  small.textContent = '漢字ヒント';
  $('hintText').replaceChildren(small, S.kanji);
}

function render() {
  const know = knowledge(cells, S);
  renderBoard(know);
  renderChips(know);
  renderGuesses();
  renderHint();

  const ranked = mode === 'ranked';
  $('tabPractice').classList.toggle('active', !ranked);
  $('tabRanked').classList.toggle('active', ranked);
  $('tabPractice').setAttribute('aria-selected', !ranked);
  $('tabRanked').setAttribute('aria-selected', ranked);
  $('cover').hidden = !coverShown();

  $('progress').textContent = ranked ? (M ? `${M.index + 1}/${MATCH_SIZE}` : '-') : '練習';
  $('genre').textContent = S.genre || '-';
  $('len').textContent = S.word ? `${[...S.word].length}文字` : '';
  $('moves').textContent = ranked ? (M ? `${totalMoves(M)}手` : '-') : `${S.moves}手`;
  $('lives').textContent = S.word ? hearts() : '-';
  $('timer').classList.toggle('running', !!timerHandle);
  if (ranked) tick(); else $('timer').textContent = '-';

  $('hint').textContent = ranked ? '💡 漢字ヒント +30秒' : '💡 漢字ヒント';
  for (const id of ['answer', 'submit', 'kDaku', 'kBack', 'kClear', 'giveUp']) $(id).disabled = S.done;
  $('hint').disabled = S.done || S.hinted;
  $('giveUp').hidden = S.done;
  $('next').hidden = ranked || !S.done;
  $('retry').hidden = !ranked || !M || !M.done;
  $('showResult').hidden = ranked ? !(M && M.done) : !S.done;
  $('flagMode').classList.toggle('on', flagMode);
  $('flagMode').setAttribute('aria-pressed', flagMode);
}

const hearts = () => '❤️'.repeat(Math.max(S.lives, 0)) + '🤍'.repeat(MAX_LIVES - Math.max(S.lives, 0));

function setMessage(t) { $('message').textContent = t; }

// ---------- result / share ----------
const guessLine = p => p.guesses.map(g => g.marks.map(m => SHARE_MARK[m]).join('')).join('\n');

// 答えが分かる情報（文字や盤面の位置）は入れない
function shareText() {
  if (mode === 'ranked') {
    const head = M.cleared ? `⏱ ${formatTime(elapsed(M))}（${totalMoves(M)}手）` : '💥 失敗…';
    const lines = M.puzzles.filter(p => p.done)
      .map((p, i) => `Q${i + 1} ${p.won ? '✅' : '💥'} ${p.moves}手${p.hinted ? ' 💡' : ''}`);
    return `五十音マインスイーパ 🔥ランクマッチ\n${head}\n${lines.join('\n')}\n${URL_SELF}`;
  }
  const head = S.won
    ? `練習：${S.genre}・${[...S.word].length}文字を ${S.moves}手で正解${S.hinted ? ' 💡' : ''}`
    : '練習：💥 ざんねん…';
  return `五十音マインスイーパ\n${head}\n${guessLine(S)}\n${URL_SELF}`;
}

function showResult() {
  if (mode === 'ranked' && M) {
    const hints = M.puzzles.filter(p => p.hinted).length;
    $('modalHead').textContent = M.cleared ? '🏁 3問クリア！' : '💥 失敗…';
    $('modalBadge').textContent = M.cleared && M.newBest ? '🎉 自己ベスト更新！' : '';
    $('modalWord').textContent = M.cleared ? formatTime(elapsed(M)) : S.word;
    $('modalGenre').textContent = M.puzzles.filter(p => p.done).map(p => `${p.word}（${p.kanji}）`).join(' / ');
    $('modalStats').innerHTML = `手数 <b>${totalMoves(M)}</b>　漢字ヒント ${hints}回`
      + (M.cleared ? '' : `<br><small style="color:var(--muted)">${M.index + 1}問目で終了</small>`);
  } else {
    $('modalHead').textContent = S.won ? '🎉 正解！' : '💥 ざんねん…';
    $('modalBadge').textContent = '';
    $('modalWord').textContent = S.word;
    $('modalGenre').textContent = `${S.kanji}（${S.genre}）`;
    $('modalStats').innerHTML = `手数 <b>${S.moves}</b>（開けた ${S.opens.length}・答えた ${S.guesses.length}）`;
  }
  renderRankBox();
  openModal($('modal'), $('closeModal'));
}

// ---------- ranking ----------
let submitting = false;

function renderRankBox() {
  const show = mode === 'ranked' && M && M.cleared;
  $('rankBox').hidden = !show;
  if (!show) return;
  $('rankForm').hidden = M.submitted;
  if (submitting) return; // 登録中は入力や表示を巻き戻さない
  if (!$('rankName').value) $('rankName').value = loadName();
  $('rankSubmit').disabled = false;
  $('rankNote').textContent = '';
  if (M.submitted) showStanding();
}

async function showStanding() {
  const match = M;
  $('rankNote').textContent = '順位を読み込み中…';
  try {
    const st = await fetchMyStanding();
    if (match !== M) return;
    $('rankNote').textContent = st ? `🏆 あなたのベスト：${st.rank}位 / ${st.total}人中（${formatTime(st.timeMs)}）` : '';
  } catch (e) {
    if (match === M) $('rankNote').textContent = e instanceof RankingError ? e.message : '順位を読み込めませんでした';
  }
}

async function onRankSubmit(e) {
  e.preventDefault();
  if (submitting || !M || !M.cleared || M.submitted) return;
  const match = M;
  // 制御文字と、見えない文字・向きを変える文字は消す（なりすましや表示崩れ防止）
  const name = $('rankName').value
    .replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁩﻿]/g, '').trim();
  if (!name) return void ($('rankNote').textContent = 'なまえを入れてね');
  saveName(name);
  submitting = true;
  $('rankSubmit').disabled = true;
  $('rankNote').textContent = '登録中…';
  try {
    await submitScore({ name: [...name].slice(0, 12).join(''), timeMs: elapsed(match), moves: totalMoves(match) });
    match.submitted = true;
    store.set(KEY.match, match);
    if (match !== M) return;
    $('rankForm').hidden = true;
    showStanding();
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
  if (tab === 'stats') renderStats($('infoBody'), loadStats());
  else renderRanking($('infoBody'));
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
$('hint').addEventListener('click', useHint);
$('giveUp').addEventListener('click', () => {
  if (S.done) return;
  const q = mode === 'ranked' ? 'ランクマッチをあきらめますか？（記録は残りません）' : 'あきらめて答えを見ますか？';
  if (confirm(q)) { S.lives = 0; finishPuzzle(false); }
});
$('next').addEventListener('click', () => enterPractice(true));
$('retry').addEventListener('click', startMatch);
$('startMatch').addEventListener('click', startMatch);
$('showResult').addEventListener('click', showResult);
$('tabPractice').addEventListener('click', () => mode !== 'practice' && enterPractice());
$('tabRanked').addEventListener('click', () => mode !== 'ranked' && enterRanked());
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

$('shareX').addEventListener('click', () => {
  window.open('https://x.com/intent/post?text=' + encodeURIComponent(shareText()), '_blank', 'noopener');
});
$('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(shareText()); toast('コピーしました'); }
  catch { toast('コピーできませんでした'); }
});

// 前の版（今日のお題・ふつう／むずい）の記録を消す
try {
  for (let n = localStorage.length - 1; n >= 0; n--) {
    const k = localStorage.key(n);
    if (/^gojuon-mines:(\d+(:hard)?|free(:hard)?|stats(:hard)?|level)$/.test(k)) localStorage.removeItem(k);
  }
} catch {}

buildBoard();
if (!store.get('gojuon-mines:seen-rules')) {
  $('rules').open = true;
  store.set('gojuon-mines:seen-rules', true);
}
if (store.get(KEY.mode) === 'ranked') enterRanked(); else enterPractice();
