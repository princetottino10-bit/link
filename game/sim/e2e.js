// ホットシート版を Playwright で最初から最後まで 1 ゲーム通して遊ぶ E2E テスト。
// 使い方：
//   1. node game/serve.js 8765         （別のターミナルで）
//   2. npm i playwright（どこかに）してから
//      node game/sim/e2e.js [url] [人間の席=0,1] [スクショ保存先]
//   既存の Chromium を使うときは環境変数 PW_CHROMIUM に chrome.exe のパスを入れる。
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = process.argv[2] || 'http://localhost:8765/';
const HUMANS = (process.argv[3] || '0,1').split(',').filter(Boolean).map(Number);
const OUT = process.argv[4] || path.join(__dirname, 'e2e-shots');
const SEED = Number(process.env.E2E_SEED || 7);

// 再現できるように、操作の選び方は固定シードの乱数で決める
let s = SEED >>> 0;
const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
const pickOne = arr => arr[Math.floor(rand() * arr.length)];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {});
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`); });

  const shots = new Set();
  const shot = async (name, full) => {
    if (shots.has(name)) return;
    shots.add(name);
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: !!full });
  };
  const click = async sel => { await page.locator(sel).first().click(); };
  const count = sel => page.locator(sel).count();
  const screen = () => page.locator('#app').getAttribute('data-screen');

  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector('[data-act="start"]');

  // 名前と人間/ボット
  const names = ['あおい', 'ベン', 'しずく', 'ダン'];
  for (let i = 0; i < 4; i++) {
    const isBot = await page.locator(`[data-act="toggle-bot"][data-seat="${i}"]`).getAttribute('aria-pressed') === 'true';
    if (isBot === HUMANS.includes(i)) await click(`[data-act="toggle-bot"][data-seat="${i}"]`);
    await page.fill(`[data-name="${i}"]`, names[i]);
  }
  await shot('01-title');
  await click('[data-act="start"]');

  let rounds = new Set(), steps = 0, choices = {}, replays = 0;
  for (; steps < 5000; steps++) {
    const sc = await screen();
    if (sc === 'final') break;
    if (sc === 'draft') {
      if (await count('[data-act="draft-focus"]') && !(await count('.botnote'))) {
        await page.locator('[data-act="draft-focus"]').nth(Math.floor(rand() * await count('[data-act="draft-focus"]'))).click();
        await shot('02-draft', true);
        await click('[data-act="draft-pick"]');
      } else await page.waitForTimeout(200);
    } else if (sc === 'gate') {
      await shot('03-gate');
      await click('[data-act="gate-ok"]');
    } else if (sc === 'deal') {
      await shot('04-objective');
      await click('[data-act="deal-ok"]');
    } else if (sc === 'plan') {
      const hand = await count('[data-act="hand"]');
      if (!hand || rand() < 0.12) await click('[data-act="refresh"]');
      else {
        await page.locator('[data-act="hand"]').nth(Math.floor(rand() * hand)).click();
        // 効果の選択を多く通すため、表にできる基地を優先する
        const up = await count('.place.can-up');
        const sel = up && rand() < 0.85 ? '.place.can-up' : '[data-act="place"]';
        await page.locator(sel).nth(Math.floor(rand() * await count(sel))).click();
        if (!shots.has('05-plan')) {
          await shot('05-plan');
          await shot('05b-plan-full', true);
        }
        // 盤面のカードの拡大表示を一度開く（表にできない理由もここに出る）
        if (!shots.has('06-card-detail') && await count('.board .mini.is-down.is-known')) {
          await click('.board .mini.is-down.is-known');
          await page.waitForTimeout(350);
          await shot('06-card-detail');
          await click('.sheet-close');
        }
      }
      await click('[data-act="plan-ok"]');
    } else if (sc === 'resolve' && await count('[data-act="replay-next"]')) {
      replays++;
      if (await count('.rp-card.is-score')) await shot('07c-replay-score');
      else if (await count('.rp-card .reveal-card')) await shot('07b-replay-reveal');
      await click('[data-act="replay-next"]');
    } else if (sc === 'resolve') {
      const kind = await page.locator('.ask').textContent();
      choices[kind] = (choices[kind] || 0) + 1;
      if (await count('[data-act="opt-card"]')) {
        const cards = page.locator('[data-act="opt-card"]');
        const skip = await count('.opt.skip');
        if (skip && rand() < 0.2) await click('.opt.skip');
        else {
          await cards.nth(Math.floor(rand() * await cards.count())).click();
          const bases = page.locator('.opts.bases [data-act="opt"]');
          await bases.nth(Math.floor(rand() * await bases.count())).click();
        }
      } else if (/表にする/.test(kind)) {
        await page.locator('[data-act="opt"]').nth(rand() < 0.85 ? 0 : 1).click();
      } else {
        const opts = page.locator('[data-act="opt"]');
        await opts.nth(Math.floor(rand() * await opts.count())).click();
      }
      if (/表にする/.test(kind)) await shot('07-reveal-faceup');
      else await shot('08-effect-choice');
      await click('[data-act="answer"]');
    } else if (sc === 'result') {
      const r = await page.locator('.phase-head .kicker').textContent();
      rounds.add(r);
      if (await count('.score-card')) await shot('09-round-result', true);
      if (!shots.has('10-log')) {
        await click('[data-act="log"]');
        await page.waitForTimeout(350);
        await shot('10-log');
        await click('.sheet-close');
      }
      await click('[data-act="next"]');
    } else {
      await page.waitForTimeout(100);
    }
    if (errors.length) break;
  }
  const final = (await screen()) === 'final';
  if (final) {
    await page.waitForTimeout(900);
    await shot('11-final');
    await shot('11b-final-full', true);
  }
  const winner = final ? (await page.locator('.winner-h').textContent()) : null;
  await browser.close();

  console.log(JSON.stringify({ final, winner, rounds: rounds.size, steps, replays, choices, errors }, null, 1));
  if (!final || errors.length || rounds.size !== 8) process.exit(1);
})().catch(e => { console.error(e); process.exit(1); });
