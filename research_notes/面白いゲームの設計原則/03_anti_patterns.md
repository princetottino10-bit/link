# ゲームを「つまらなく」するアンチパターンと設計上の処方箋（Anti-patterns & Fixes）

> 調査メモ（2026-10-09）。各アンチパターンについて、定義・なぜ面白さを損なうか・テストプレイでの検出方法・設計上の対処（実例つき）を整理した。
> 「Cited Findings」は出典URLで裏付けたもの。「Inferences」は出典を踏まえた推論、または筆者（調査者）の一般知識に基づく補足で、**出典未確認**のものは明記している。
> 注意: 一部の出典は二次ソース（ブログ・ニュースサイト）であり、Mark Rosewater 等の一次発言を直接確認できていない箇所がある（各所に明記）。

---

## 1. キングメイキング（Kingmaking）

### Takeaway
勝ち目のないプレイヤーが「誰を勝たせるか」を決められてしまう状態。リーダーの主体性（agency）を奪い、長いゲームほど不満が大きい。対処は「誰が勝っているかを見えにくくする」「ゲームを短くする」「脱落者を出さない／早く終わらせる」の3系統。

### Cited Findings
- 定義: 勝つ見込みのない（ostensibly no chance）プレイヤーが、攻撃・妨害の相手を選ぶことで最終的な勝者に影響を与えること。ボードゲームでは負の体験とされ、リーダー側の主体性を奪う — [The Thoughtful Gamer: Losing Propositions](https://thethoughtfulgamer.com/2017/09/16/losing-propositions/)（検索スニペット経由。本文は取得失敗）
- 長いゲームほどキングメイキングのコストが大きい（「勝者がキングメイキングで決まるなら、不満足な結末に多くの時間を費やしたことになる」）。*Kemet* はゲームの長さ（短さ）で緩和、*Dominant Species* は「誰が勝っているか正確に分かりにくい」ため *Eclipse*/*Kemet* より優れている、という比較 — [The Thoughtful Gamer](https://thethoughtfulgamer.com/2017/09/16/losing-propositions/)（スニペット経由）
- 「kingmaking」の語は Garfield の用法として言及されることがあるが、語源はもっと古いという指摘もあり、帰属は未確認 — [GreaterWrong コメント](https://greaterwrong.com/posts/jkf2YjuH8Z2E7hKBA/diplomacy-as-a-game-theory-laboratory/comment/3FuAJLwB7wQmazH3W)
- 欧州型（ユーロ）ゲームは直接対決を避け、隠し得点で「最後まで全員が勝者候補」と感じさせる — [DiGRA 2018: Understanding Player Elimination in Boardgames as a Form of Permadeath (Rogerson, Gibbs, Carter, Allison)](https://dl.digra.org/index.php/dl/article/download/1003/1003)

### Inferences
- 検出方法（推論）: テスト後に「自分が勝てないと分かった時点はいつか」「その後、誰を妨害するかをどう決めたか」を聞く。「どうせ勝てないから○○さんを殴った」という発言が出たら兆候。
- 対処パターン（推論＋上記出典）: ①隠し得点・終了時ボーナスで順位を不透明化、②ゲームを短くし「次の1戦」で取り返せるようにする、③直接攻撃の対象選択を減らす（全員に等しく効く効果、隣接プレイヤー限定など）、④脱落者を生まない構造。

### Gaps
- *Characteristics of Games* 本文における kingmaking の正式定義は直接確認できず。

---

## 2. ランナウェイリーダー（Runaway leader / Snowballing）と、キャッチアップ機構の過不足（Rubber-banding）

### Takeaway
「持つ者がさらに得る」正のフィードバックが強すぎると、序盤で勝負が決まり残りが消化試合になる。一方、キャッチアップが強すぎると上手いプレイが罰せられ戦略派が不満を持つ。多くのデザイナーは「キャッチアップ機構は根本的な設計問題への絆創膏」と見ており、代替として「向かい風（headwinds）」「複数の勝ち筋」「加速終了」を挙げる。

### Cited Findings
- 定義: リードしているプレイヤーがさらにリードを広げる利益を得る仕組み＝正のフィードバックループ（the more you have, the more you get）。runaway leader 機構自体は善悪ではなく設計上の選択 — [brandonthegamedev: Colony – Letting Leaders Lead without Losing Losers](https://brandonthegamedev.com/colony-letting-leaders-lead/)
- *Characteristics of Games*（Elias, Garfield, Gutschera）第3章は「Catch-Up」を遊びの根本的な現象・パラドックスとして扱う（ゲームが面白くあり続けるには追う側がリーダーに近くにいる必要がある） — [検索結果中の書評引用](https://www.ericzimmerman.com/assets/pdfs/Characteristics_of_Games_foreword.pdf)（序文PDF。章内容は二次情報）
- League of Gamemakers の座談会での各デザイナーの見解 — [Ask the League: Should games have a catch-up mechanic?](https://leagueofgamemakers.com/ask-the-league-should-games-have-a-catch-up-mechanic)
  - Luke: キャッチアップは「後ろにいるプレイヤーに固有の優位を与える」もので、runaway leader という深い問題の症状。好むのは「向かい風（headwinds）」＝前進すると以後の手番が苦しくなる仕組み。例: *Dominion* の勝利点カード（デッキを弱くする）。James Ernest を引き、キャッチアップは多くの場合「誰が本当のリーダーかを隠す」だけと指摘。
  - Peter: キャッチアップはパッチ。*Power Grid* の手番順調整はプレイヤーに「わざと控える」ことを強い、*Suburbia* の「レッドライン」は不自然。タイル自体のバランスで解決すべき。
  - Brad: キャッチアップはカジュアル/ファミリー向けには有効だが、戦略ゲームでは上手いプレイへの報酬を期待するプレイヤーを苛立たせる（＝過剰なラバーバンディングの害）。
  - Steve: 見かけの終わりと実際の終わりを一致させ「事実上の脱落（de facto elimination）」を避けるべき。代替は「加速終了（Accelerated Ending）」＝絶望的に遅れたプレイヤーがいたらゲームを早く終わらせる。
  - Christian: 2人用 *Splendor* はエンジンの固定化で勝者が早期に予測できてしまう。途中で戦略変更できる設計を望む。
- *Catan* は誰かがリードすると盗賊（Robber）の標的になる、という社会的なバランス回復の例 — [Anil Dash: Elastic Happiness（Wired記事の引用）](https://anildash.com/2009/04/06/elastic_happiness)
- *Power Grid* は「経済エンジン系で先頭に追いつけない」問題を回避していると評価され、その要が手番順操作（強い発電所・大きなネットワークを持つほど手番順で不利になる）。レビュアーはこれがないと「1/3地点でリーダーが分かる」とする一方、「不格好な解決」とも評価 — [There Will Be Games: Power Grid retrospective](https://therewillbe.games/articles-boardgame-reviews/3974-the-electric-co-power-grid-retrospective)（スニペット経由。手番順を「キャッチアップ機構」と明言しているかは不明確で、そこは解釈）
- 「runaway leader は序盤の好プレイに報いるために必要だが、強すぎるとゲームが終わる前に終わる。弱すぎるとゲームの勢いを奪い、序盤に頑張る動機がなくなる」という整理 — [検索結果の総括（brandonthegamedev 他）](https://brandonthegamedev.com/colony-letting-leaders-lead/)

### Inferences
- 検出方法（推論）: 各ラウンド終了時のスコア推移を記録し、「中盤時点の首位が最終首位になる確率」を見る。これが極端に高ければスノーボール、極端に低ければラバーバンディング過剰（＝序盤の判断が無意味）。また「途中でわざと得点を控えた」という行動が出たら、キャッチアップが上手いプレイを罰しているサイン（Power Grid 型）。
- 対処パターン整理: ①負のフィードバックを「コスト」として内包（Dominion の勝利点カードが手札を汚す）、②リーダーへの社会的標的化（Catan 盗賊）、③手番順・オークションで先頭に不利（Power Grid）、④複数の勝ち筋、⑤加速終了、⑥順位の不透明化（隠し得点）。

### Gaps
- *Characteristics of Games* の Catch-Up 章の具体的な分類（例: 先頭への負のフィードバック、ゲーム長の調整等）を本文で確認できなかった。

---

## 3. 長考（Analysis Paralysis, AP）、ダウンタイム（Downtime）、長い手番、セットアップ/片付けの重さ

### Takeaway
AP は「選択肢が多すぎる・複雑すぎる・結果の評価が難しすぎる」ことで生じ、ターン制ではそれが他プレイヤーのダウンタイムに直結する。League of Gamemakers は10の対処法（フェーズ分割、選択肢の制限、短い手番、隠し情報/ランダム性、機会費用の低減、段階的エスカレーション、激変の抑制、計算の削減、視覚情報の削減、同時手番）を挙げている。

### Cited Findings
- AP の原因: 判断が複雑すぎる、選択肢が多すぎる、結果が評価しにくい。一貫したメカニクスで「手順でなく戦略に頭を使える」ようにし、明確な目標を与える — [League of Gamemakers: Designing Games to Prevent Analysis Paralysis Part 1](https://leagueofgamemakers.com/designing-games-to-prevent-analysis-paralysis-part-1)
- 10の対処法（Part 2） — [League of Gamemakers Part 2](https://www.leagueofgamemakers.com/designing-games-to-prevent-analysis-paralysis-part-2)
  1. 手番をフェーズに分割: *Dominion*（アクション→購入）、*MTG*（アンタップ・アップキープ・ドロー）、*The Manhattan Project*（配置か回収かの二択）
  2. 選択肢を制限: *Carcassonne* は1手番1タイル。複数タイルなら組み合わせで悩む
  3. 手番を短く: *Dominant Species* は長い手番がさらに長い手番を生む例
  4. 隠し情報やランダム性:「完璧な手」が計算できないので良い手から選べばよくなる。*Lords of Waterdeep* の秘密のロードカード。完全情報の *チェス* 等は長考を招く。James Ernest の "Volatility in Game Design" 講演を参照
  5. 機会費用を下げる: *New York 1901* のテストでは強い手が常に別の強い手を犠牲にし、後悔と AP を生んだ
  6. 段階的に複雑化: *Upon a Fable* は序盤ミスが致命的、*Runewars* は序盤から選択肢過多
  7. 激変を防ぐ: *Dominion* はサプライが常に見えるので先の計画が立てられる
  8. 計算を減らす: トークン・トラックで加減算に。数学がテーマのゲームは例外
  9. 視覚情報を減らす: 色・駒・情報密度を減らす（*Arkham Horror* は巨大だが愛されている例外）
  10. 同時手番: *Race for the Galaxy* の役職選択
- ダウンタイムと AP は別概念（ダウンタイム＝自分の手番間の通常の待ち時間）。ターン制では AP が過度のダウンタイムを生み、時間制限で他者への悪影響を防げる — [BGDF: Understanding Downtime](https://bgdf.com/forum/game-design/topics-game-design/understanding-downtime); [VU Amsterdam Game Design Patterns: Analysis Paralysis](https://math.vu.nl/~eliens/media/pattern-analysisparalysis.html)
- 選択肢と「最善だったか」という内的疑念が増えるほど、各選択の分析に時間がかかる（選択のパラドックス） — [Games Precipice: Downtime](https://www.gamesprecipice.com/downtime/)
- タイマー（砂時計）はダウンタイム削減以外にも目的を持たせるべきという議論 — [BGDF](https://bgdf.com/forum/game-design/topics-game-design/understanding-downtime)

### Inferences
- 検出方法（推論）: 手番ごとの所要時間をストップウォッチで記録し、平均と分散（特定プレイヤー・特定局面で跳ねるか）を見る。待っている側がスマホを見始める、ルールブックを読み返す、雑談が始まる＝ダウンタイム過多のサイン。
- セットアップ/片付け（出典未確認・一般知識）: 収納トレイ・プレイヤー別トレイ、初期配置の固定化（ビギナーセットアップ）、コンポーネント数削減が一般的な対処。
- 他プレイヤーの手番中にもやることを作る（手番外の反応・同時計画）もダウンタイム対策として広く使われる（一般知識、未出典）。

### Gaps
- セットアップ/片付け時間に関する体系的な一次資料は見つからなかった。

---

## 4. マルチプレイヤー・ソリティア（Multiplayer solitaire）／インタラクション不足 と 過剰なテイク・ザット（Take-that）、プレイヤー脱落（Player elimination）

### Takeaway
インタラクションが少なすぎると「他人がいる意味がない」、直接攻撃が多すぎると標的化・恨み・キングメイキングが生じ、脱落は「待つだけ」の時間を生む。現代ホビー界は脱落を避ける傾向。中間解は「間接インタラクション（取り合い・先取り）」「短いゲームでのみ脱落を許す」。

### Cited Findings
- *Race for the Galaxy* はプレイヤー間の直接インタラクションが少ないので投了の影響が小さいが、行き過ぎると「対戦相手が無関係なマルチプレイヤー・ソリティア」になる — [Law of Game Design: Concession-Proofing Your Game](https://lawofgamedesign.com/2014/10/08/theory-concession-proofing-your-game/)
- 脱落（player elimination）は「脱落者を除いてプレイが続く」状況（BGG定義）。現代ユーロは脱落を避け、隠し得点で最後まで全員を勝者候補に保つ — [DiGRA 2018 (Rogerson et al.)](https://dl.digra.org/index.php/dl/article/download/1003/1003)
- 脱落のある *The Red Dragon Inn* は早期脱落後にゲームがだらだら続くのが問題。「現代ホビー界が脱落を取り除くようになった理由がある。うまくやるのは難しい」 — [Bumbling Through Dungeons: Red Dragon Inn Review](https://bumblingthroughdungeons.com/red-dragon-inn-review/)
- 脱落のあるゲームは短くあるべき。代替として遅れたプレイヤーが追いつけるようにし、リーダーがリードを広げにくくする — [VU Amsterdam Game Design Patterns: Eliminate](https://math.vu.nl/~eliens/media/pattern-eliminate.html)（検索スニペット経由の要約）
- 一時的除去と恒久的除去の区別（バックギャモンの駒は再入場できる） — [VU Amsterdam: Eliminate](https://math.vu.nl/~eliens/media/pattern-eliminate.html)
- MTG の妨害（Denial）デッキは多人数戦で特に苦しむ（Beth Moursund, *The Duelist* #8, 1995 の引用） — [Hipsters of the Coast: The Feelbadism of Discard](https://hipstersofthecoast.com/2023/06/the-feelbadism-of-discard)

### Inferences
- 検出方法（推論）: 「他プレイヤーの行動で自分の計画が変わった回数」を数える（0に近ければソリティア）。逆に「狙われた」「恨みで攻撃した」という感想が出ればテイク・ザット過剰。脱落者が出たら脱落から終了までの時間を測る。
- 対処の傾向（推論）: 直接攻撃→間接競合（ワーカープレイスメントの枠の先取り、共有市場の取り合い）に置き換える；攻撃に「自分もコストを払う」設計；攻撃対象を「全員」または「リーダー」に固定；脱落は短時間ゲームに限定するか、脱落者に別の役割を与える。

### Gaps
- Stonemaier（Jamey Stegmaier）のインタラクション/脱落に関するブログ記事は検索で特定できなかった。

---

## 5. 支配的戦略（Dominant strategy）、解かれたゲーム（Solved game）、壊れたコンボ・無限ループ（Degenerate combos / Infinite loops）

### Takeaway
1つの戦略・カードが最適解になると、デッキ/戦略の多様性とプレイパターンの多様性が失われる。デジタルCCG/TCGでは禁止・制限・ナーフで事後修正し、多人数カジュアル（Commander）では「パワー帯（ブラケット）」で事前に期待値を合わせる。

### Cited Findings
- Oko, Thief of Crowns の Standard 禁止（2019年11月）: メタゲームの多様性とゲームプレイの多様性を低下させ、ビルドアラウンド系クリーチャー/アーティファクトを封じた。パワーが健全な水準を超えていた — [Wizards: November 18, 2019 Banned and Restricted Announcement](https://magic.wizards.com/en/news/announcements/november-18-2019-banned-and-restricted-announcement?2)
- Modern での Oko・Mox Opal・Mycosynth Lattice 禁止（2020年1月）: Oko は競技 Modern で最も使われたカードとなり、メタの多様性とプレイパターンの多様性を下げた — [Wizards: January 13, 2020 B&R Announcement](https://magic.wizards.com/en/articles/archive/news/january-13-2020-banned-and-restricted-announcement); [Hipsters of the Coast](https://www.hipstersofthecoast.com/2020/01/oko-thief-of-crowns-mox-opal-and-mycosynth-lattice-banned-in-modern/)
- Commander Brackets（2025年2月発表）: 5段階のパワー帯。Bracket 1〜3 では「大量土地破壊（mass land denial）」「意図的な2枚無限コンボ」等をガイドラインで制限、Bracket 1 では追加ターンも不可。「Game Changers」リストは「ゲームを劇的に歪め、リソースで独走させ、多くのプレイヤーが不快に感じる形で展開を変え、他人のプレイを封じ、デメリットなしに最強カードを探せる」カード群で、Bracket 1-2 で禁止、3 では3枚まで — [Commander's Herald: WOTC Introduces New 5 Bracket System](https://commandersherald.com/wotc-introduces-new-5-bracket-system-for-commander/); [EDHREC](https://cloudflare.edhrec.com/articles/wotc-introduces-new-bracket-system-for-edh)
- 2025年10月にブラケット更新（チューター制限撤廃、Game Changers から10枚削除）。その後もリストは変動しており、出典間で現行リストに食い違いあり — [Card Kingdom Blog](https://blog.cardkingdom.com/commander-brackets-game-changers-update/)（詳細未検証）
- 「解けた」完全情報ゲームは長考を招きやすく、隠し情報/ランダム性で「完璧な手」を消す — [League of Gamemakers Part 2](https://www.leagueofgamemakers.com/designing-games-to-prevent-analysis-paralysis-part-2)

### Inferences
- 検出方法（推論）: テストで勝者の戦略を記録し、特定戦略の勝率・採用率を集計する。上級テスターに「壊してくれ」と依頼する（ブレイク・テスト）。無限ループはカード同士の「戻す・再利用」効果の組み合わせを機械的に洗い出す。
- 対処（推論）: 回数制限（1ターン1回）、終了条件の上限（ラウンド制）、コストのスケーリング、禁止/制限リスト、ソーシャルな事前合意（ブラケット）。

### Gaps
- ボードゲーム（非CCG）での支配的戦略修正の具体的事例（例: 拡張での調整）について一次資料を確保できず。

---

## 6. ランダム性の過不足（Too much randomness vs. too deterministic）と マナスクリュー/フラッド（Mana screw/flood）

### Takeaway
ランダム性はAPを減らし再現性を下げるが、過剰だと「自分の判断が関係ない」と感じる。CCGの土地事故はその典型で、Hearthstone は自動増加のマナクリスタル、Marvel Snap は固定エネルギー＋撤退（Retreat）＋確定初手カードで対処した。一方MTGは土地システムに肯定的価値も見ている。

### Cited Findings
- Hearthstone: 土地の代わりにマナクリスタル。毎ターン1つ増え全回復、上限10。マナ不足（mana drought）を除去 — [Top Tier Tactics（ガイド）](https://toptiertactics.com/?p=19959)（Brode 本人による設計意図の説明は確認できず）
- Marvel Snap: 1試合6ターン、ターンNにNエネルギー（自動）。土地事故は構造的に存在しないが、序盤に高コストばかり引くリスクは残る — [Hearthstone Top Decks: The Hearthstone Player's Guide to Marvel Snap](https://www.hearthstonetopdecks.com/the-hearthstone-players-guide-to-marvel-snap/); [Sportskeeda](https://www.sportskeeda.com/esports/what-does-snapping-do-in-marvel-snap)
- Marvel Snap の撤退（Retreat）はマリガンの代替として設計。悪い手札なら撤退して1キューブ失うだけ。敗北画面の表示を "You Lose!" から "Escaped!" に変更（Brode「戦略的に正しいから離れるのは負けじゃない」）— [mobilegamer.biz: Ben Brode reveals Marvel Snap's recipe](https://mobilegamer.biz/second-dinners-ben-brode-reveals-marvel-snaps-recipe-for-success-literally/); [Massively OP](https://massivelyop.com/2022/11/11/first-impressions-of-marvel-snap-an-addictive-mobile-card-game-by-hearthstones-former-director/)
- Marvel Snap: マリガン要望が多かったため、必ず初手に来る1コストカード Quicksilver をスターターに追加し、要望は消えた — [mobilegamer.biz](https://mobilegamer.biz/second-dinners-ben-brode-reveals-marvel-snaps-recipe-for-success-literally/)
- Hearthstone の Discover カードを「デッキトップに置く」案は、次ターンに答えを引けないと分かり無力感を与えたため、シャッフルに変更（Brode & Ayala, IGN 2016） — [Wowhead](https://ru.wowhead.com/news/ben-brode-and-dean-ayala-talk-about-creating-the-discover-mechanic-250903)
- Rosewater は2006年 Great Designer Search で「マナスクリューがMTGに与える3つの良い影響」を応募者に問うた（＝スクリューに設計上の価値を見ている示唆。本人の回答は未確認） — [MTG Wiki: Great Designer Search](https://mtg.wiki/page/Great_Designer_Search)
- 応募者の回答例: スクリューは一貫性とパワーのトレードオフを強い、同じゲームが2度とない状態を生む（応募者の意見でありRosewaterの見解ではない） — 同上
- 批判側: 色事故と土地事故の二重のランダム性がある — [TappedOut フォーラム](https://tappedout.net/mtg-card/commander-greven-il-vec/)
- ランダム性は「完璧な手」を消しAPを減らす（James Ernest "Volatility in Game Design" 参照） — [League of Gamemakers Part 2](https://www.leagueofgamemakers.com/designing-games-to-prevent-analysis-paralysis-part-2)
- *Killer Bunnies* は最終結果をダイスで決め、全員に最後まで希望を持たせる（投了防止の文脈） — [Law of Game Design](https://lawofgamedesign.com/2014/10/08/theory-concession-proofing-your-game/)

### Inferences
- 検出方法（推論）: 「負けた理由」を聞き、「引きが悪かった」が支配的ならランダム性過剰。逆に「最初の数手で結果が見えた」ならば決定論過剰。CCGでは「何もできなかったターン数」を記録する。
- 対処整理（推論）: 入力ランダム（Input randomness: 先に乱数、後で判断）を好み、出力ランダム（Output randomness: 判断後に乱数で結果）を抑えるのが定石（一般知識・未出典）。マリガン、資源の自動増加、資源と呪文の両用カード（例: 手札を資源に変換する仕組み）、デッキ枚数の縮小で分散を下げる。
- Lorcana のインクウェル（任意のカードを資源化）や Flesh and Blood のピッチ（カードを資源として捨てる）も土地事故回避策として言及されることが多い（一般知識、本調査では出典未確認）。

### Gaps
- Brode/Blizzard による「なぜ土地でなくマナクリスタルか」の一次説明は見つからなかった。
- Rosewater の「土地システムを変えない理由」を述べたMaking Magic記事は特定できなかった。

---

## 7. 情報過多（Information overload）、面倒な維持管理（Fiddly upkeep）、例外ルール過多、盤面が読めない（Unclear board state）

### Takeaway
プレイヤーの処理能力には限りがあり、視覚情報過多や計算過多は「戦略ではなく盤面の解読」に頭を使わせる。一貫したメカニクス・トークン/トラック化・情報密度の削減が基本処方。

### Cited Findings
- 一貫したメカニクスにより、プレイヤーは手順ではなく戦略に集中できる — [League of Gamemakers Part 1](https://leagueofgamemakers.com/designing-games-to-prevent-analysis-paralysis-part-1)
- 計算を減らす: トークン・キューブ・トラックで加減算に、視覚的手がかりでヒューリスティック判断を可能に — [League of Gamemakers Part 2](https://www.leagueofgamemakers.com/designing-games-to-prevent-analysis-paralysis-part-2)
- 視覚情報を減らす: 駒・色・情報密度を減らし、補色を使い、区別できる余白を確保。散らかった画面は盤面解読を強いる — 同上
- 激変を防ぎ盤面を安定させると計画が立てやすい（*Dominion* のサプライ常時公開） — 同上
- Rosewater は Commander で「stun counter はメモ代わり（memory aide）になり得るが、本当の問題はそれらが促すゲームプレイ」と述べたとされる（＝トラッキング負荷と体験の問題を区別） — [mtgrocks](https://mtgrocks.com/mtg-head-designer-discusses-land-destruction-replacement/)（二次ソース）

### Inferences
- 検出方法（推論）: ルール質問の回数・ルールブック参照回数を記録、「忘れていた処理（アップキープ忘れ）」の発生回数を数える。忘れが頻発する処理は削るか、物理的リマインダー（トークン・ボード上の印刷）に置き換える。
- Hearthstone 等デジタルゲームは処理を自動化できるが、紙のゲームでは「誘発の数×状態の数」が直接負荷になる（推論）。

### Gaps
- 「例外ルールの数」と面白さの関係を定量的に扱った資料は見つからず。

---

## 8. 盛り上がらない終盤（Anticlimactic endings）、勝負がついたのに続く消化試合（"Long march to defeat"）、膠着・亀（Stalemate / Turtling）

### Takeaway
「事実上決着した後」の時間は投了・離脱を生む。処方は「決着点で終わらせる」「順位を不透明にする」「後半に伸びる力（成長軸）」「勝利以外の目標」、膠着には「強制解決ルール」「時間/ラウンド上限」。

### Cited Findings
- 投了を減らす手法 — [Law of Game Design: Concession-Proofing Your Game](https://lawofgamedesign.com/2014/10/08/theory-concession-proofing-your-game/)
  - 逆転の仕組み（ただし強すぎるとゲームが無意味に感じる）
  - 隠し得点: *Small World*、*Puerto Rico*。秘密目標の終了時公開も同様
  - 予測不能な終わり方: *Killer Bunnies* の最終ダイス
  - 時間とともに伸びる能力（リーダーを上回るか、別の軸で伸びる）
  - **クライマックスで終わる**: 一方の負けが事実上決まったらそこで終える。*Warmachine*/*Hordes* はリーダー（ウォーキャスター）が倒れたら終了
  - 勝利以外の目標: *Agricola* は農場を作ること自体が報酬なので投了されにくい
  - より大きな大会・連戦の一部にする
- 「加速終了（Accelerated Ending）」: 絶望的に遅れた人がいればゲームを素早く終わらせる；見かけの終わりと実際の終わりを一致させる — [League of Gamemakers](https://leagueofgamemakers.com/ask-the-league-should-games-have-a-catch-up-mechanic)
- Board Game Arena での提案: プレイヤーの最大可能得点を追跡し、閾値を下回ったら投了を可能にする等 — [BGA Forum: Can we stop conceding with one move to go?](https://forum.boardgamearena.com/viewtopic.php?p=238715)
- 「投了を防ぐ“正しい”ゲーム長は存在しない」 — [Law of Game Design](https://lawofgamedesign.com/tag/small-world/)
- 膠着: *Diplomacy* の「ステイルメイト・ライン」は盤面構造上の防衛線で、上手く遊ぶと単独勝利が起きないという論もあり、作者はこれを盤の構造の欠陥とみなす — [Diplomacy Archive: The Curse of Stalemate Lines](https://diplom.org/~diparch/resources/strategy/articles/stalemate_curse.htm)
- 強制解決ルールの例: 同一局面が繰り返されたらどちらかが「ステイルメイト」を宣言して即終了できる（Pasta Logic 上級ルール） — [nishio: Avoid Draws](https://scrapbox.io/nishio-en/Advanced_Pasta_Logic_Rule:_Avoid_Draws)
- Marvel Snap は6ターン固定＋撤退で、負け試合を長引かせない（撤退時は1キューブ損失のみ） — [mobilegamer.biz](https://mobilegamer.biz/second-dinners-ben-brode-reveals-marvel-snaps-recipe-for-success-literally/)

### Inferences
- 検出方法（推論）: 「勝敗が分かったのはいつか」を全員に聞き、その時点から終了までの時間を測る。終盤に「計算すれば誰が勝つか分かる」状態が長ければ問題。膠着は「数ラウンド盤面がほぼ変化しない」ことで検出。
- 「long march to defeat」は確立した学術用語としては確認できなかった（MTG/対戦ゲームコミュニティの俗語的用法と推測）。

### Gaps
- 「long march」という用語の出典は見つからなかった。
- エンドゲーム・トリガー（Scythe の星6つ、Terraforming Mars の全パラメータ達成など）を設計パターンとして論じた一次資料は今回未確保。

---

## 9. 意味のある選択がない手番（Non-games / Auto-pilot turns）

### Takeaway
選択肢がない、または選択肢があっても差がない手番は退屈。対処は「機会費用のある選択」「状況に応じて価値が変わる選択」「フェーズ分割で小さな判断を連続させる」。ただし選択肢を増やしすぎると AP に転じるため、選択肢の「数」ではなく「差」を設計する。

### Cited Findings
- Marvel Snap: 序盤に高コストばかり引くと「何もすることがない」ターンが生じ得る（＝自動操縦ターン）。これを Quicksilver の確定初手配置と撤退で緩和 — [Hearthstone Top Decks](https://www.hearthstonetopdecks.com/the-hearthstone-players-guide-to-marvel-snap/); [mobilegamer.biz](https://mobilegamer.biz/second-dinners-ben-brode-reveals-marvel-snaps-recipe-for-success-literally/)
- 一方で機会費用が高すぎ（全手が等価に強い）ると後悔と AP を生む（*New York 1901*） — [League of Gamemakers Part 2](https://www.leagueofgamemakers.com/designing-games-to-prevent-analysis-paralysis-part-2)
- 弱いカードの存在はMTGの「探索のゲーム」としての本質の一部（Rosewater 2002 "When Cards Go Bad"） — [Making Magic: When Cards Go Bad](https://magic.wizards.com/en/news/making-magic/when-cards-go-bad-2002-01-28)（検索スニペット経由）

### Inferences
- 検出方法（推論）: 各手番後に「他の選択肢を検討したか？」を記録。「やることが決まっていた」手番の割合が高ければ自動操縦。マナカーブ的に「使えるリソースに対して出せるものがない」ターンもカウントする。
- Sid Meier の「面白い選択の連続」の定義（一般知識、未出典）がこの問題の基準としてよく引用される。

### Gaps
- 「auto-pilot」を直接論じたボードゲーム設計記事は今回特定できなかった。

---

## 10. 先手有利（First-player advantage）と補償方法

### Takeaway
多くのゲームで手番順による有利/不利が存在し、資源・カード枚数の傾斜配分で補償するのが一般的。ただし補償は過剰になりやすい（数学的研究で「後手に追加手番」は逆に後手有利になる例）。

### Cited Findings
- *Agricola*: 他の全プレイヤーに追加の食料1を与えて先手有利を相殺 — [Games Precipice: Turn Order](https://www.gamesprecipice.com/turn-order/)（検索スニペット経由、本文は503で取得失敗）
- *Everdell*: 先手は5枚、以降の手番順ごとに1枚ずつ多く配る。*Century* シリーズは席順で初期資源を変える。*Codenames* は後手チームの当てるべきカードが1枚少ない — 同上（スニペット経由）
- BGA の *Agricola* 席順統計（2022-23）: 最後の席は得点・勝率とも明確に不利。3-4人戦では2番席が1番席よりやや良い。Elo差では説明できない。4人戦で1番席約26%、4番席約23%（n=8944、オンラインの自己選択データであり統制実験ではない） — [BGA Forum: Agricola Statistics Update](https://forum.boardgamearena.com/viewtopic.php?p=147926); [2025年更新](https://forum.boardgamearena.com/viewtopic.php?p=226318)
- 不偏ゲーム（Nim、Chomp）で「後手が初手直後に追加手番」補償を検討した数学論文: バランスは取れず、多くの初期局面で後手に明確な優位を与えてしまう（＝過補償） — [Minnesota Journal of Undergraduate Mathematics](https://pubs.lib.umn.edu/index.php/mjum/article/download/4152/2843/19124)
- *Puerto Rico* の序盤は BGG ユーザーにより詳細分析（"Main Line"）されているが、コミュニティ分析で未検証 — [BGA Forum: Opening Theory](https://forum.boardgamearena.com/viewtopic.php?p=40478)
- *Power Grid* では強いプレイヤーほど手番順で不利になる（先手有利の動的補正としても機能） — [There Will Be Games](https://therewillbe.games/articles-boardgame-reviews/3974-the-electric-co-power-grid-retrospective)

### Inferences
- 検出方法（推論）: 席順別の勝率・平均得点をテストで集計（十分なサンプルが必要。BGA統計のように数千局規模でようやく数％差が見える）。
- その他の定番補償（一般知識・本調査では出典未確認）: 囲碁のコミ、Hearthstone の後攻「The Coin」＋追加カード、スネーク順ドラフト（1-2-3-3-2-1）、スタートプレイヤーの持ち回り、手番順の入札（オークション）、同時手番化。

### Gaps
- Hearthstone の The Coin 導入理由の一次資料は今回確認せず。

---

## 11. カードゲームの「フィールバッド（Feel-bad）」メカニクス：土地破壊、手札破壊、カウンター、ハードロック

### Takeaway
「相手に遊ばせない」系の効果（リソース否定・手札破壊・打ち消し・ロック）は、戦術的に正当でも受け手の体験を大きく損なう。MTG と Hearthstone はどちらもこれを意識し、「ソフト化（遅延・代替・相殺）」「コストを重くする」「カジュアル帯での自主規制（ブラケット）」で対処している。

### Cited Findings
- **カウンター（打ち消し）**: Rosewater は「カウンターは大多数のプレイヤーにとって楽しくないゲームプレイを生む」と考えている（Tumblr 回答として引用） — [Hipsters of the Coast: Counter Them Softly in Commander](https://www.hipstersofthecoast.com/2022/02/counter-them-softly-in-commander/)（一次: [markrosewater.tumblr.com](https://markrosewater.tumblr.com/post/129368729418/if-you-could-change-the-past-would-you-diversify)、本文未確認）
- **ソフトカウンターの代替設計**（同記事）: *Remand*（手札に戻し自身はキャントリップ）、*Delay*/*Ertai's Meddling*（遅れて解決）、バウンス系（*Venser, Shaper Savant*、*Divide by Zero* 等、再キャスト可能）、*Arcane Denial*/*Dream Fracture*（打ち消すが相手もカードを引く＝補填）、パーマネント型（*Decree of Silence* 等、除去すれば突破可能）— [Hipsters of the Coast](https://www.hipstersofthecoast.com/2022/02/counter-them-softly-in-commander/)
- **土地破壊**: Rosewater は Wizards が「土地へのスタンカウンター」を「土地破壊ライト（land destruction lite）」として試していると述べた（2025年4月頃）。例: *Magmatic Hellkite* は非基本土地を破壊するが、相手は基本土地をサーチできスタンカウンター付きで戻るため、長期的なマナ損失にはならない。以前は「問題はそれが促すゲームプレイ」と否定的だった — [mtgrocks (2025-04-19)](https://mtgrocks.com/mtg-head-designer-discusses-land-destruction-replacement/)（二次ソース、Rosewater 原文未確認）
- Commander Brackets は Bracket 1〜3 で「大量土地破壊（mass land denial）」を不可とし、Game Changers の基準に「他人のプレイを封じる（block people from playing）」「多くのプレイヤーが不快と感じる形でゲームを変える」を含む — [Commander's Herald](https://commandersherald.com/wotc-introduces-new-5-bracket-system-for-commander/); [EDHREC](https://cloudflare.edhrec.com/articles/wotc-introduces-new-bracket-system-for-edh)
- **手札破壊（Discard）がつらい理由**（コラムニストの考察）: 機会の喪失（負けるより「手札を失う」方がつらい）、個人攻撃感、ゲームが止まる即時性（first strike/ward のような計画段階で処理されるキーワードより対立的）、物理的に手に持つカードを失う感覚（ミル＝ライブラリー破壊の方が手に入る前なので許容されやすい）、「ライブラリー＝未来、手札＝現在、墓地＝過去」で手札破壊は「戻る道がない」感覚 — [Hipsters of the Coast: The Feelbadism of Discard](https://hipstersofthecoast.com/2023/06/the-feelbadism-of-discard)（Wizards 公式見解ではない）
- **Hearthstone**: 開発チームは「カードを捨てる・焼く（burn）」などの負の感情に慎重であることを繰り返し強調。*Void Contract*（両者のデッキの半分を捨てる）について Stephen Chang は「初見でエキサイティングで状況により強いが、大きな犠牲と多くのマナを要求する」と説明（＝重いコストで正当化） — [Hearthstone Top Decks: Interview with Stephen Chang (BlizzCon 2018)](https://www.hearthstonetopdecks.com/interview-with-hearthstone-game-designer-stephen-chang-at-blizzcon-discussing-rastakhans-rumble-design/)
- Hearthstone の Discover で「デッキトップ配置」は次ターンに答えが引けないと分かって無力感を生むためシャッフルに変更 — [Wowhead](https://ru.wowhead.com/news/ben-brode-and-dean-ayala-talk-about-creating-the-discover-mechanic-250903)

### Inferences
- 共通原理（推論）: フィールバッドの核は「相手の手番で自分の選択肢が消える／自分が何もできない時間」。対処は (a) 失ったものを補填する（引く・基本土地を戻す）、(b) 否定ではなく遅延にする、(c) 効果に高コスト・自傷を課す、(d) ランダム選択より「選ぶ側の判断」が見える形にする、(e) 多人数カジュアルでは社会的合意（ブラケット）で期待値を揃える、(f) 完全ロックは時間制限・回数制限で解除可能にする。
- 検出方法（推論）: テスト後の感想で「何もできなかった」「やられて萎えた」を記録、被害側が投了・離席を考えた瞬間を聞く。勝率に影響がなくても体験の悪さは別指標で測る必要がある。
- Hearthstone がMTG型の汎用カウンターを持たず、Secret（*Counterspell* 秘策）として「相手が見える条件付き」にしている点はソフト化の一例（一般知識、本調査で出典未確認）。

### Gaps
- Rosewater の Making Magic 本文で土地破壊・カウンター・ディスカードを論じた回（例: Mechanical Color Pie）の原文は取得できなかった。
- Marvel Snap 開発ブログでの「フィールバッド」議論（例: 特定カードのナーフ理由）は今回確保できず。
- ハードロック（Stax, Blood Moon 等）を直接論じた Wizards 公式記事は未確認（Commander Brackets の「block people from playing」が最も近い）。
