# カード・勢力・カードゲームシステム設計の技法（Card Design Craft）

対象：Smash Up 型の勢力（ファクション）合体＋Compile 型の値/効果カードを持つオリジナルカードゲーム。
主な情報源：Mark Rosewater（MTG ヘッドデザイナー）の「Making Magic」コラム・GDC 講演、Ben Brode（Hearthstone）、Paul Peterson（Smash Up）、Lukas Litzsinger（Android: Netrunner）、Richard Garfield（KeyForge）。

---

## Q1. Mark Rosewater の設計原則（Ten Things / 20 Lessons / サイコグラフィック / レンティキュラー / NWO）

### Takeaway
Rosewater の原則は「プレイヤーの心理に合わせて設計し、制約を活かし、カードごとに狙う客層（Timmy/Johnny/Spike）をはっきりさせる」の3点にまとまる。入門者が触れる層は簡単に保ち（NWO）、簡単に見えて奥がある（レンティキュラー）カードで深さを出す。

### Cited Findings

**ゲームに必要な10のこと（Ten Things Every Game Needs, 2011）**
- 1. 目標（Goal）：「ゲームには目的が必要」。目標は魅力的で、明確でなければならない — [Making Magic: Ten Things Part 1](https://magic.wizards.com/en/news/making-magic/ten-things-every-game-needs-part-1-2011-10-24)
- 2. ルール（Rules）：できることを制限し、目標達成を簡単にしすぎない — 同上
- 3. 相互作用（Interaction）：「プレイヤー同士が反応し合う要素が必要」 — 同上
- 4. 追い上げ要素（Catch-Up Feature）：「勝てる見込みがないと感じるとゲームはストレスになる」 — 同上
- 5. 慣性（Inertia）：ゲームが確実に終わる仕組みを組み込む — 同上
- 6. 驚き（Surprise）：予測できない要素。手札・山札などの隠れた情報とランダム性が緊張感とリプレイ性を生む — [Making Magic: Ten Things Part 2](https://magic.wizards.com/en/news/making-magic/ten-things-every-game-needs-part-1-part-2-2011-12-19)
- 7. 戦略（Strategy）：「遊ぶほど上手くなる」。学習が報われる — 同上
- 8. 楽しさ（Fun）：知らない人にテストプレイしてもらい「また遊びたいか？」を聞く — 同上
- 9. フレーバー（Flavor）：「フレーバーは参入障壁を下げる」。テーマはメカニクスに意味を与え、ルールを説明する役割も持つ — 同上
- 10. フック（Hook）：「良いフックはシンプルですぐ分かるもの」「その役割は教えることではなく、興味を引くこと」 — 同上
- この内容は Drive to Work ポッドキャストで1項目ずつ深掘りされている（#177 Goal, #189 Rules, #201 Interaction など） — [podscripts: DTW #201](https://podscripts.co/podcasts/magic-the-gathering-drive-to-work-podcast/drive-to-work-201-10-things-every-game-needs-interactions)

**20年で学んだ20の教訓（Twenty Years, Twenty Lessons, GDC 2016）**
- GDC Vault の講演概要では、例として「制約は創造性を生む（Restrictions Breed Creativity）」「人間の本性と戦うのは負け戦（Fighting Human Nature Is a Losing Battle）」「皆が好きだが誰も愛していないゲームは失敗する」が挙がっている — [GDC Vault](https://www.gdcvault.com/play/1023186/)
- 20の教訓の一覧（ファンによる講演ノート） — [hamatti notes](https://notes.hamatti.org/sources/talks/'magic-the-gathering'-20-years,-20-lessons-learned-by-mark-rosewater)：
  1. 人間の本性と戦うのは負け戦。Errant Ephemeron（待機/Suspend）は召喚酔いの理解を混乱させたので、速攻（haste）を付けた。ゲームのほうをプレイヤーに合わせる。
  2. 美しさ（Aesthetics）は大事。Griselbrand（7/7、8マナ、7点払って7枚引く）のように、バランス・対称性・パターンの完成で「しっくりくる」こと。
  3. 共鳴（Resonance）は大事。プレイヤーが既に持っている感情（例：ゾンビ）の上に乗る。
  4. 便乗（Piggybacking）を使う。既知の知識で学習を楽にする。「Akroan Horse」を「Akroan Lion」に改名すると誰も理解できなくなり、トロイの木馬の名前に戻すと理解された。
  5. 「興味深い」と「楽しい」を混同しない。カードを捨ててモンスターを強化する案は嫌われた。プレイヤーはカードを「使いたい」。
  6. ゲームが呼び起こす感情を理解し、それに貢献しないものは削る。
  7. プレイヤーがゲームを自分のものにできるようにする（カスタマイズ）。
  8. 細部でプレイヤーは恋に落ちる（Fblthp の例）。
  9. 所有感（Ownership）を与える（統率者戦はプレイヤー発祥）。
  10. 探索の余地を残す。シナジーはプレイヤーに発見させる。
  11. 皆が好き（7点）だが誰も愛さないゲームは失敗する。10点と1点に分かれるカードのほうが良い。
  12. できることを証明するために設計しない（エゴの抑制）。
  13. 楽しい行動を勝つための正しい戦略にする。Unhinged の「Gotcha」メカニクスでは何もしないのが最善になり、プレイヤーは楽しさを最適化で消してしまった。
  14. はっきり言うことを恐れない。
  15. 対象とする客層に合わせて部品を設計する。Molten Sentry（コイン投げ）は体験派にも競技派にも響かなかった。
  16. 挑戦させることより退屈させることを恐れよ。
  17. 少し変えるだけで全てが変わる（ラヴニカの2色ギルド）。
  18. 制約は創造性を生む。
  19. 観客は問題を見つけるのは得意だが、解決するのは苦手（患者と医者のたとえ）。
  20. すべての教訓はつながっている。
- 「audience is good at recognizing problems and bad at solving them」は上記 Lesson 19 に当たる — 同上

**サイコグラフィック（Player Psychographics）**
- Timmy/Tammy は体験（大きな瞬間）、Johnny/Jenny は自己表現、Spike は何かを証明すること（主に勝利）のために遊ぶ。全員を喜ばせようとすると誰も喜ばない — [hamatti notes, Lesson 15](https://notes.hamatti.org/sources/talks/'magic-the-gathering'-20-years,-20-lessons-learned-by-mark-rosewater)
- Vorthos はサイコグラフィックではない。「なぜ遊ぶか」ではなく「何を気にするか」の別軸（フレーバー重視）。Timmy-Vorthos のように組み合わさる — [Making Magic: Melvin and Vorthos (2007)](https://magic.wizards.com/en/news/making-magic/melvin-and-vorthos-2007-05-07)
- Melvin（現在は Mel）はメカニクスの美しさ（デザインの職人性）を重視する側。Vorthos と対で「美的な双子（Aesthetic Twins）」と呼ばれる — [Draftsim: Vorthos](https://draftsim.com/mtg-vorthos/)（二次情報）

**レンティキュラー・デザイン（Lenticular Design, 2014）**
- 傾けると別の絵が見えるレンティキュラー印刷が名前の由来。初心者にはシンプルに見え、上級者には奥深さが見えるカード — [Making Magic: Lenticular Design](https://magic.wizards.com/en/articles/archive/making-magic/lenticular-design-2014-03-31)
- 例は Black Cat。初心者には「死ぬと相手が手札を1枚捨てるおまけ付きの2マナ1/1」。上級者には「死亡誘発こそが本体で、相手の攻撃判断を変える」カード — 同上
- 同記事は複雑さを「理解の複雑さ（comprehension）」「盤面の複雑さ（board）」「戦略の複雑さ（strategic）」に分けている — 同上

**New World Order（NWO、複雑さの予算）**
- コモンの複雑さを下げる方針。新規プレイヤーは持っているカードが少ないので、コモンが体験の大部分を占める。複雑さは高レアリティへ移して、入口を易しくしつつ奥深さを保つ — [Making Magic: New New World Order](https://magic.wizards.com/en/news/making-magic/new-new-world-order-2013-03-29)
- NWO の背景として、プレイヤー数の減少の原因を「理解・盤面・戦略の複雑さ」と分析した。コモンは戦場に出ている間、他の1枚より多くのカードに影響しない、という目安がある — [MTG Wiki: New World Order](https://mtg.wiki/page/New_World_Order)（検索スニペット経由。直接取得は403）
- 導入時期は資料によって2007〜2008年頃と食い違う — 同上 / [StarCityGames](https://articles.starcitygames.com/articles/new-world-order-and-complexity-creep/)

**関連：Hearthstone の「複雑さ」と「深さ」**
- Ben Brode：複雑さ（ルール文の量）と戦略的な深さ（意味のある判断の量）は別物。Whirlwind、Acolyte of Pain、Frothing Berserker というシンプルなカードで「史上最も難しいデッキの一つ」ができた。「深さ÷複雑さ」の比が高いカードが最良のデザイン。シンプルな部品を組み合わせて深さを出す — [Hearthstone Top Decks](https://www.hearthstonetopdecks.com/ben-brode-defining-complexity-depth-design-space/)
- デザイン空間（Design Space）は有限。バニラ→キーワードのみ→…と使い切っていく。1枚のカードがデザイン空間を消費・制限する（Magma Rager が突撃系デザインを塞ぐ例） — 同上

### Inferences
- オリジナルゲームでは、勢力ごとに「入門者向けの低複雑度カード」と「上級者向けの組み合わせカード」の比率を決めておく（NWO 的な複雑さの予算）。例：1勢力あたり誘発/継続効果の数に上限を設ける。
- Compile 型の値カードは、数値（バニラ的部分）と効果の両方を持つので、レンティキュラー設計に向いている。初心者には「数値が大きい」、上級者には「効果のタイミングが本体」になる。
- Lesson 5・13 は特に重要：「捨てて強化」のような楽しくない最適解や、「何もしない」が最善になる構造は避ける。

### Gaps
- 「fight against the gotcha」という言い回しの一次出典は見つからなかった。Lesson 13 の Unhinged「Gotcha」例が最も近い。
- 「トップダウン vs ボトムアップ設計」についての Rosewater の一次記事は今回取得できていない（KeyForge 開発記事で両方の併用に触れられている。Q2 参照）。
- 「Twenty Years, Twenty Lessons」の Making Magic 記事版は未取得。上の一覧はファンの講演ノートに基づく。

---

## Q2. 勢力・色のアイデンティティ設計（カラーパイ / Smash Up / Netrunner / KeyForge）

### Takeaway
勢力は「できること」と同じくらい「できないこと」で定義する。各勢力に明確な動詞・プレイスタイルを持たせ、その弱点を他の勢力と組み合わせて補う構造が、混ぜる遊び（Smash Up、Netrunner の影響力、KeyForge のハウス）の面白さを生む。

### Cited Findings
- MTG のメカニカル・カラーパイは、各効果を色ごとに「主（primary）・副（secondary）・三次（tertiary）」で割り当てる。主はその効果が最も多く、最も低いレアリティで出る色。例：黒の先制攻撃は三次で、主に騎士で出る。2017年版を2021年に更新し、「色の評議会（Council of Colors）」が協力した — [Making Magic: Mechanical Color Pie 2021](https://magic.wizards.com/en/news/making-magic/mechanical-color-pie-2021)
- カラーパイは「何ができないか」で定義される。緑は打ち消しを持たず、青は直接ダメージを持たず、黒はエンチャント除去を持たない — [Casual Planeswalker: The Color Pie Explained](https://casualplaneswalker.com/wiki/color-pie)（二次情報）
- 色の役割は時代とともに少しずつ動く（例：赤へのマナ生物・宝物の拡大） — [Draftsim](https://draftsim.com/?p=239727)（二次情報）
- Smash Up（Paul Peterson）：「シャッフル・ビルディング」は、CCG 的なデッキのカスタマイズを、圧倒されずに実現する方法として考案された。異なる勢力が協力するテーマは「自然に合った」。初期案はミニオンを積み重ねて合体させる（ニンジャ＋ロボット）設計だったが、基地の支配を争う設計にしてから「うまくはまった」 — [Theology of Games: Paul Peterson](https://www.theologyofgames.com/blog/tag/Paul+Peterson)
- Smash Up の勢力は定番のイメージ（Tropes）に基づいている。拡張「Awesome Level 9000」では、各新勢力が新しいメカニクスと戦略を加えつつ、基本ルールの範囲にとどまった（ルールを変える前に世界を広げる）。クトゥルフ拡張では Madness カードを導入し、勢力ごとに扱いを変えた（クトゥルフは強いカードの代わりに Madness を受け取る、ミスカトニックは Madness を燃料にする） — 同上
- Netrunner（Lukas Litzsinger）：Genesis サイクルでは「各勢力の強みと弱みを固め、明確にする」ことを狙った。Haas-Bioroid はより防御的に、Criminal はより速く、Jinteki はよりトリッキーに。アイデンティティカードはトレードオフのある選択で、デッキ構築の制約も決める。ただしプレイ中は複雑さではなくフレーバーを足すものにした — [FFG: Data and Destiny ほか（検索要約）](https://www.fantasyflightgames.com/en/news/2015/6/1/data-and-destiny/)
- Netrunner の影響力（Influence）システムは、勢力を混ぜる創造性を促し、ほぼどのカードでもどのデッキに入れられるようにする — [NYU Game Center: Lukas Litzsinger](https://gamecenter.nyu.edu/game-designers-in-detail-lukas-litzsinger/)
- KeyForge：各デッキは7つのハウスのうち3つから構成され、ハウスごとに背景とプレイスタイルが違う。Garfield のプロトタイプはボトムアップとトップダウンの両方を含み、ファンタジー/SFの定番イメージがメカニクスに影響した — [FFG: The Long and Winding Road](https://www.fantasyflightgames.com/en/news/2018/9/21/the-long-and-winding-road/), [KeyForge – Wikipedia](https://en.wikipedia.org/wiki/KeyForge)
- 「少し変えるだけで全て変わる」：ラヴニカは5色ではなく2色ギルドに物語を付け、最も人気のあるセットの一つになった — [hamatti notes, Lesson 17](https://notes.hamatti.org/sources/talks/'magic-the-gathering'-20-years,-20-lessons-learned-by-mark-rosewater)

### Inferences
- Smash Up 型では「2勢力の組み合わせ」がそのまま2色ギルドに相当する。勢力ごとに1つの中心動詞（例：増やす・壊す・動かす・引く）と、意図的な弱点（例：除去できない）を決め、組み合わせで弱点を補えるようにするとよい。
- Smash Up のクトゥルフの例のように、共通のリソース（Madness）を勢力ごとに違う意味で扱わせると、少ない追加ルールで勢力間の差が出せる。
- 勢力にはトレードオフと「できないこと」の一覧を、効果の一覧と同じく文書化する（メカニカル・カラーパイのような勢力表）。

### Gaps
- Smash Up の勢力内のカード構成（20枚デッキ、ミニオン/アクションの比率など）について、Peterson 本人の一次出典は今回見つからなかった。
- Compile（Michael Yang）のプロトコル設計についての資料は今回調査できていない。
- KeyForge のハウス設計について Garfield 本人の詳しい発言は、FFG の記事「The Enigmatic Architect」の本文まで届かず未確認。

---

## Q3. カードテキストの設計（キーワード、テンプレート、可読性、バニラテスト）

### Takeaway
キーワードはフレーバーを付け、2回目以降の読みを速くする。ルール文は短く、カード1枚が1つのことをうまくやるのが基本。数値の基準はバニラ（効果なし）カードで作る。

### Cited Findings
- Ben Brode：キーワードはカードのフレーバーを決める助けになり（例：Inspire）、2回目以降はテキストを読みやすくする。キーワードは厳選してセットごとに入れ替える。Poisonous や Lifesteal のような基本的な戦闘キーワードは戦闘を面白くする。カードの説明はできるだけシンプルに保つ — [Inven Global: Ben Brode interview](https://www.invenglobal.com/hearthstone/articles/4797/ben-brode-on-the-witchwoods-most-dangerous-card-its-shudderwock)（検索要約）
- 一貫性（Consistency）は大事だが、デジタルではゲームが審判をするので、紙のゲームほど厳格でなくてよい — 同上
- 「バニラテスト」：合計スタッツとコストを比べて、クリーチャーの強さを判断する目安。リミテッドでより重要 — [MTG Wiki: Vanilla](https://mtg.wiki/page/Vanilla)（検索スニペット）
- Rosewater：バニラ・クリーチャーは本質的に退屈なのではなく、伝統的に平均以下の強さで作られている。コストの刻み（C と 1C の間）がないので、トーナメント級のバニラ2/2は作れない — [Making Magic: Let's Start at the Very Beginning (2003)](https://magic.wizards.com/en/news/making-magic/lets-start-very-beginning-2003-07-14)（検索要約）
- 「Vanilla matters は構築の中心にしにくいテーマ」（Rosewater） — [mtgrocks](https://mtgrocks.com/mtg-players-keep-trying-to-make-vanilla-creatures-matter/)（二次情報）
- 便乗：既知の名前や概念（トロイの木馬）でカードの働きが分かるようになる。名前はルール説明の一部 — [hamatti notes, Lesson 4](https://notes.hamatti.org/sources/talks/'magic-the-gathering'-20-years,-20-lessons-learned-by-mark-rosewater)
- 美しさ：数字のパターン（Griselbrand の 7/7・7点・7枚）が覚えやすく「しっくりくる」 — 同上 Lesson 2
- 盤面の複雑さを抑えるため、低レアリティのカードは戦場で他の1枚より多くに影響しないようにする — [MTG Wiki: New World Order](https://mtg.wiki/page/New_World_Order)（検索スニペット）

### Inferences
- Compile 型の値カードでは、まず「効果なしの数値だけのカード」で基準カーブを作り、効果1つごとに数値をいくら下げるかの換算表を作るとバランス調整が楽になる（バニラテストの応用）。
- 効果は「登場時（on-play）」「継続（ongoing）」「誘発（triggered）」で盤面の追跡コストが大きく違う。継続・誘発効果は盤面の複雑さを増やすので、低複雑度カードでは登場時効果を中心にするとよい（NWO の「1枚にしか影響しない」目安の応用）。
- フレンチバニラ（キーワードのみのカード）は、勢力のキーワードを教えるための入門カードとして使える。

### Gaps
- 「French vanilla」、テンプレート規約、ルール文の長さの目安（文字数・行数）について、一次出典は今回取得できなかった。
- 「do one thing well」の明示的な出典も見つからなかった。

---

## Q4. リソースシステムとコストカーブ（テンポ vs カードアドバンテージ、質 vs 量）

### Takeaway
今回の調査ではこの項目の一次資料はほとんど集まらなかった。わかったのは、コストの刻みが粗いとバランスの選択肢が限られること、そして複雑さと深さを分けて考えること（Brode）。

### Cited Findings
- コストの刻みが粗いと、適切な強さに調整できないカードがある（C と 1C の間がない） — [Making Magic: Let's Start at the Very Beginning](https://magic.wizards.com/en/news/making-magic/lets-start-very-beginning-2003-07-14)（検索要約）
- Hearthstone では「ヒーローパワーを使うか、カードを使うか」というリソース配分の判断が深さを生む — [Hearthstone Top Decks](https://www.hearthstonetopdecks.com/ben-brode-defining-complexity-depth-design-space/)
- 慣性（Inertia）：ゲームが確実に終わる仕組みが必要。リソースが増え続けるだけだと終わらない — [Ten Things Part 1](https://magic.wizards.com/en/news/making-magic/ten-things-every-game-needs-part-1-2011-10-24)
- 追い上げ要素が必要。リソースの差が雪だるま式に広がると負けている側の興味が失われる — 同上

### Inferences
- 値（Compile の 0〜6 のような数値）をコストとして使う場合、刻みが小さいほど調整しやすいが、覚える数字が増える。刻みの数と調整幅のトレードオフを決めておく。
- 「1枚で2枚分の仕事」（カードアドバンテージ）と「早く盤面に影響する」（テンポ）を勢力の個性の軸にできる（例：ある勢力は手札を増やすが遅い、別の勢力は速いが息切れする）。これは一般的な知識からの推論で、今回出典は確認していない。

### Gaps
- カードアドバンテージ理論（Brian Weissman の「The Deck」など）、テンポ理論、マナカーブ設計の一次出典は今回調べられなかった。別途調査が必要。

---

## Q5. コンボ・シナジー・寄生的メカニクス（Parasitic）・ビルドアラウンド

### Takeaway
シナジーは「プレイヤーに発見させる」余地を残すと所有感が生まれる。ただし、特定のカード群とだけ働く寄生的メカニクスは程度の問題で、最近の MTG はまとまった「パッケージ」としてなら受け入れるようになっている。

### Cited Findings
- 寄生的メカニクス（Parasitic）とは、そのセット/ブロックのカードの一部とだけ機能するもの（例：Kamigawa の「連繋（Splice onto Arcane）」は秘儀カードとしか機能しない）。寄生性は有無ではなく程度の問題 — [mtgrocks: Rosewater on parasitic](https://mtgrocks.com/magic-the-gathering-head-designer-explains-what-is-and-isnt-a-parasitic-mechanic/)
- 人々が問題にしているのは、実際には直線性（Linearity）であることが多い。侍は後のセットで支援カードが増えて寄生性が下がった — 同上
- 「R&D は最近、寄生的なパッケージ（一緒に使えるカードのまとまり）をより受け入れている」 — [mtgrocks: parasitic mechanics increase](https://mtgrocks.com/parasitic-mechanics-increase-mtg/)
- 探索の余地を残す：シナジーはプレイヤーに発見させる。自分が始めたものに人はより多く投資する — [hamatti notes, Lesson 10](https://notes.hamatti.org/sources/talks/'magic-the-gathering'-20-years,-20-lessons-learned-by-mark-rosewater)
- シンプルな部品を組み合わせて深さを出す（Whirlwind + Acolyte of Pain + Frothing Berserker） — [Hearthstone Top Decks](https://www.hearthstonetopdecks.com/ben-brode-defining-complexity-depth-design-space/)
- Brode は Shudderwock を The Witchwood で最も危険なカードとして挙げた（誘発効果の再実行によるコンボの危険性） — [Inven Global](https://www.invenglobal.com/hearthstone/articles/4797/ben-brode-on-the-witchwoods-most-dangerous-card-its-shudderwock)（見出しのみ確認）
- KeyForge のドラフト実演で Garfield は、各ハウスが次のハウスの戦略を壊し、自滅の循環になるデッキを紹介した（ハウス間の相互作用は良くも悪くも働く） — [KeyForge 検索要約 / goodgamery](https://goodgamery.com/?p=8408)

### Inferences
- Smash Up 型では、勢力同士のシナジーは「勢力Aの共通の動詞」×「勢力Bの共通の動詞」で自然に生まれるようにし、特定の勢力名を参照するカードは避ける（寄生性を下げる）。
- 無限ループを防ぐには、「誘発効果が誘発効果を再実行する」構造（Shudderwock 型）や「コスト0で戻る」構造を設計ルールとして禁止・制限するのが実用的（推論）。
- ビルドアラウンドカードは Johnny 向けに作る（Lesson 15）。全員向けに作らない。

### Gaps
- 無限ループ・壊れたコンボを防ぐための体系的なチェックリストの一次出典は見つからなかった。
- 「ビルドアラウンド（build-around）」の定義についての Rosewater の一次記事は今回未取得。

---

## Q6. 非対称デザインのベストプラクティス

### Takeaway
非対称は「各勢力の強みと弱みを明確にし、トレードオフのある選択」として作る。非対称な要素（Netrunner のアイデンティティ）は、デッキ構築の判断には大きく影響させても、プレイ中の複雑さを増やさないようにする。

### Cited Findings
- Netrunner のアイデンティティは「難しい選択」で、どれを選ぶかでゲームのテンポが変わる。アイデンティティはカードごとの判断に影響したが、中心のゲームプレイを隠さないようにした。プレイ中は複雑さではなくフレーバーを足すもの — [FFG（検索要約）](https://www.fantasyflightgames.com/en/news/2015/6/1/data-and-destiny/), [Android: Netrunner – Wikipedia](https://en.wikipedia.org/wiki/Android:_Netrunner)
- 勢力の差をより鮮明にする（防御的・速い・トリッキー） — 同上
- Smash Up のクトゥルフ拡張：同じリソース（Madness）でも、勢力によって罰・燃料・攻撃手段と役割が違う — [Theology of Games](https://www.theologyofgames.com/blog/tag/Paul+Peterson)
- 全員を喜ばせようとせず、10点と1点に分かれる要素を作る。非対称な勢力ごとに熱烈なファンができる構造 — [hamatti notes, Lesson 11](https://notes.hamatti.org/sources/talks/'magic-the-gathering'-20-years,-20-lessons-learned-by-mark-rosewater)
- 追い上げ要素（Catch-Up）は、非対称な勢力同士で差が大きくなりすぎるのを和らげる — [Ten Things Part 1](https://magic.wizards.com/en/news/making-magic/ten-things-every-game-needs-part-1-2011-10-24)

### Inferences
- 勢力ごとに「得意なこと／苦手なこと／勝ち方」の3行カードを作り、全勢力の組み合わせ（Smash Up なら勢力数Cで2）で極端に弱点が重なる組み合わせがないかを表でチェックする。
- 非対称性はルール例外としてではなく、共通ルールの上の「カードの効果」として表現すると、複雑さを抑えられる（Netrunner の「プレイ中はフレーバー」の方針の応用）。

### Gaps
- 非対称ゲームのバランス調整手法（勝率データ、組み合わせ数の多いゲームでのテスト計画）についての出典は今回見つからなかった。
- Smash Up の勢力バランス調整方法についての Peterson の発言は見つからなかった。

---

## Q7.（追加スコープ）4人プレイ（マルチプレイ）向けのカード・勢力設計

### Takeaway
4人戦では、カードが「誰に効くか」が設計の中心になる。「各対戦相手（each opponent）」は政治を起こさず公平だが効果が人数倍になる。「対戦相手1人を選ぶ（target opponent）」は政治・ヘイトを生む。Smash Up は「基地ごとに1〜3位に得点」という構造で、1人だけを狙うより場所の取り合いに集中させている。MTG の多人数メカニクスは「先頭を叩かせて試合を接戦にする」方向で設計されている。

### Cited Findings
- **Smash Up の基地得点**：基地上の合計パワーがブレイクポイント以上になると得点する。パワー1位・2位・3位がそれぞれ基地カードの1番目・2番目・3番目の数字の勝利点を得て、4位以下は0点。同点は全員がその順位の点を得る（2人が1位タイなら次は3位扱い）。15点で勝利 — [Smash Up 公式ルール PDF](https://cdn.shopify.com/s/files/1/2546/6116/files/rules-smash-up.pdf), [AEG SU6 Rulebook](https://www.alderac.com/wp-content/uploads/2014/06/SU6_Rulebook.pdf)
- 得点資格は版によって違う：古い版は「ミニオン1体以上」、後の版は「ミニオン1体以上またはパワー1以上」 — 同上 / [nomadgames manual](https://nomadgames.co.uk/smash-up-manual)
- 得点前（before scoring）・得点後（after scoring）の特殊カード（Special）を使うタイミングがあり、手番外の割り込みを作っている — 同上（検索要約）
- **Rosewater と統率者戦の政治**：「対戦相手があなたのすべきことを提案できるなら、それは政治的だ」。誰を攻撃するかをハウスルールで固定しない限り、多人数戦は政治的になる。本人は交渉が好きではないが、統率者戦が存在することを喜んでいる — [Wargamer: Rosewater says Commander is always political](https://www.wargamer.com/magic-the-gathering/commander-mark-rosewater-political)
- Rosewater：統率者戦は最も遊ばれているテーブルトップ形式 — [Wargamer: new casual two-player format](https://www.wargamer.com/magic-the-gathering/new-casual-two-player-format)（検索要約）
- **MTG の多人数メカニクスの狙い**（Card Kingdom ブログ、筆者の分析） — [Card Kingdom Blog](https://blog.cardkingdom.com/the-real-impact-of-multiplayer-mechanics-in-magic/)：
  - 統治者（Monarch）：戦闘で奪い合える「毎ターン追加ドロー」の称号。戦闘の役割を回復し、リソース不足を補う。
  - イニシアチブ（Initiative）：統治者に似るが、管理の手間が大きく、統率者戦では報酬が物足りないと評価されている。
  - 扇動（Goad）：クリーチャーにコントローラー以外のプレイヤーを攻撃させる。使われすぎて、強制攻撃が「ミスプレイを強いられる」感覚になるという批判がある。
  - 評議会の投票（Will of the Council）：盤面に関係なく全員が平等に発言できるが、多数決で罰されるのは殺伐とした多人数戦に合わないという意見がある。
  - 協力・取引系（Join Forces、Pendant of Prosperity）：恩恵を断ると取り残される「囚人のジレンマ」を作る。
  - 全体の狙い：先手を取る攻撃を促し、しばしば「一番豊かな/強いプレイヤー」を攻撃させて試合を接戦に保つ。一方で「誰を攻撃するか」の選択を強制しすぎると主体性を奪う、という批判も筆者は述べている。
- 統率者向けメカニクス「アンコール（Encore）」は、対戦相手1人ごとにトークンのコピーを作る（人数に比例する効果） — [Wargamer（検索要約）](https://www.wargamer.com/magic-the-gathering/commander-mark-rosewater-political)
- **テンプレートの実例**：「誘惑の申し出（Tempting offer）」カードは「各対戦相手は〜してもよい」と全員に提案し、受けた人数に応じて自分も得をする。対戦相手は手番順（自分の左隣から）に受けるかどうかを決める（Tempt with Vengeance 2013年の裁定）。一方、Secret Rendezvous は「あなたと対戦相手1人を対象とし、それぞれ3枚引く」で、誰と組むかを選ばせる — [AetherHub: Tempt with Vengeance](https://aetherhub.com/Card/C13/Tempt-with-Vengeance/125), [Card Kingdom: Tempt with Mayhem](https://www.cardkingdom.com/mtg/modern-horizons-3-commander-decks/tempt-with-mayhem)
- **キングメイキング**：キングメイキングはプレイヤーの問題ではなく設計の問題。全員が勝てる範囲にいると感じるか、勝利条件（得点）が隠れていると、キングメイキングは大きく減る — [BGDF Forum: TIGD Kingmaking](https://www.bgdf.com/forum/archive/archive-game-creation/topics-game-design/tigd-kingmaking-common-problem-2)
- 「テイクザット（Take-that）」のゲーム For A Crown のレビュー：2人が互いを先頭だと思って叩き合うと、目立たない他のプレイヤーが得をする。誰か1人を明らかに助けると他の全員が気づいて均衡を取ろうとする。隠れた勝利点がキングメイキングを抑えている — [Zatu: Reviewing For A Crown](https://zatu.com/blogs/reviews/reviewing-for-a-crown-a-study-in-constitutional-nonsense)
- 追い上げ要素（Catch-Up）はゲームに必須：勝てる見込みがないとゲームはストレスになる — [Ten Things Part 1](https://magic.wizards.com/en/news/making-magic/ten-things-every-game-needs-part-1-2011-10-24)

### Inferences
- 対象の書き方を3つに分けて使い分けるとよい（推論）：
  - 「各対戦相手（all opponents）」：公平で政治が少ない。効果は3倍になるので、数値は1人対象より小さくする。全体除去・全体ドロー妨害など。
  - 「対戦相手1人を選ぶ（choose an opponent）」：先頭叩き・報復を生む。ヘイトを集めすぎないよう、効果の大きさを抑えるか、「最も得点が高いプレイヤー」のような条件で対象を自動で決めて「先頭を叩く」方向に誘導する（MTG の統治者・Encore の狙いに沿う）。
  - 「左隣/右隣のプレイヤー」：選択の政治を消し、手番順の流れに組み込める。毎回同じ相手に当たる不公平感があるので、座席が固定でも全員に回るよう「左隣」と「右隣」を勢力ごとに散らす。
- Smash Up 型の「場所（基地）ごとに1〜3位に得点」は、4人戦で1人だけを狙い撃ちするより「どこに置くか」を競わせる構造。2位・3位にも得点があるので、負けている人にも参加する理由がある（追い上げ要素）。カード効果も「この基地の他のミニオン」のように場所単位で作ると、特定の1人を狙うカードが減る。
- 「1人にしか関係しない」カード（例：1人の手札を見る、1人と交換する）は、他の2人が待つだけの時間を作る。全員が反応できる（受ける/断る、投票する）か、場所単位の効果にするとダウンタイムが減る（Tempting offer の構造が参考）。
- 「強制攻撃」（Goad）型の効果は主体性を奪うと批判されているので、「〜しなければならない」より「〜すると報酬」の形にする。
- 勝利点を部分的に隠す、または全員が勝利圏にいるように終盤の得点を大きくすると、キングメイキングを減らせる。

### Gaps
- Rosewater が多人数戦向けのテンプレート（each opponent と target opponent）の使い分けを説明した一次記事は見つからなかった。上の使い分けは実例カードからの推論。
- Smash Up の Paul Peterson が4人戦の得点設計（1〜3位得点の意図）について語った一次資料は見つからなかった。
- 統治者（Monarch）などのデザイナー本人による設計意図の記事は今回取得できなかった（Card Kingdom の記事は筆者の分析で、デザイナーの引用はない）。
