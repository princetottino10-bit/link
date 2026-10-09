# プレイテストとバランス調整：個人インディー開発者向けの実践プレイブック (Playtesting & Balancing Playbook)

想定読者：個人の趣味デザイナー＋少人数の友人＋シミュレーションコードを書けるAIアシスタント。
注：調査ツールの一部は要約を返すタイプで、GDC Vault（Slay the Spire の講演本編）や一部PDFは本文を読めなかった。各項目に一次資料か二次資料かを付記した。

---

## 1. プロトタイピング：紙プロトタイプ、最小限のゲーム (Minimum Viable Game)、早い段階での「面白さ探し」 (Find the Fun)

### Takeaway
最初のプロトタイプは手書き・使い捨てでよい。重要なのは「遊べる状態」をすぐ作ることで、遊べるものを作ると曖昧なアイデアの中身を具体的に決めざるを得なくなる。紙なら数値の修正→再プレイを同じ午後のうちに何度も回せる。デジタル化や見た目の作り込み (polish) は、ゲームが壊れずに最後まで回るようになってから行う。

### Cited Findings
- 遊べるものを作ると、システムを実際に設計せざるを得ない（「50枚の未定義カードがある」といったごまかしが効かなくなる）。ボードゲームなら、まず2人で試せる物理的なコマを用意する — [Creating Games (Plymouth State Univ. 講義資料)](https://creatinggames.press.plymouth.edu/?p=107)
- 紙のプロトタイプには限界もある。ターン制やシステム中心のゲームには向くが、タイミングや器用さを競うメカニクスやデジタルUIの検証には向かない。デザインが見た目頼りになっていたら、システム設計が弱いサイン — [Creating Games](https://creatinggames.press.plymouth.edu/?p=107)
- 初心者向けの手順：数値やメモを手書きで入れる →「何度も、いろいろな形で壊れる」ことを前提に回す → 最後まで問題なく回るまで直す → その後にデジタルデータ化して印刷する。手書きの段階は形だけに思えても省かない — [Entro Games: The Absolute Beginner's Guide to Making a Physical Prototype](https://entrogames.substack.com/p/the-absolute-beginners-guide-to-making-a-physical-prototype)
- カードゲームは紙でカードの数値や能力をすぐ変えられ、一日の午後で何ラウンドもテストできる。デジタルツールの準備コストもかからない — [Wayline: paper prototyping for game developers](https://www.wayline.io/blog/paper-prototyping-for-game-developers)（業界ブログ）
- Jesse Schell『The Art of Game Design』の要約：プロトタイプは1つの問いに答えるためだけに作り、磨き込まず、愛着を持たない（学生の開発日誌による孫引きなので、原文の文言は未確認） — [devlog 8 (itch.io)](https://vigentian.itch.io/devlogs/devlog/620355/devlog-8)
- 実践例：ノート → スプレッドシートでルールとカードを管理 → 画像はネットの仮素材を使う、という流れ — [421.news: A Guide to Making and Playtesting Your Own Board Game](https://www.421.news/en/making-and-playtesting-a-board-game/)

### Inferences
- AIアシスタントがいる場合は、カードリストを最初から CSV/JSON の「単一の情報源 (single source of truth)」にしておくとよい。そこから印刷用シートとシミュレーター用データの両方を生成すれば、紙とコードの数値がずれない。
- 「1つの問いに答えるためのプロトタイプ」という原則から、各テストの前に「今回確かめたい問い」を1〜2行書いておくのが有効と考えられる（例：「このコア・ループ (core loop) だけで5ターン楽しいか？」）。

### Gaps
- Cardboard Edison、Daniel Solis、Stonemaier の「find the fun」「最小限のゲーム」に関する一次記事は、今回の検索では見つからなかった。

---

## 2. プレイテストの段階：社内 → 友人 → ブラインド、何を観察し何を聞くか、偏ったフィードバックの避け方

### Takeaway
テストは「自分だけ（社内）→ 身近な人（ローカル）→ ルールブックだけで遊んでもらう（ブラインド）」の3段階で進めるのが定番。ブラインドテストでは、ルールについての質問は答えがルールに書いてあっても1件残らず「ルールの改善点」として扱う。フィードバックは「何が起きたか・なぜか・どう感じたか」の形で集める。答えを誘導する質問 (leading question) は避け、自由回答式 (open-ended) で聞く。

### Cited Findings
- 「社内 (Internal)・ローカル (Local)・ブラインド (Blind)」の3段階という枠組み — [BackerKit: The 3 stages of playtesting](https://www.backerkit.com/blog/tabletop-games-crowdfunding-roadmap/playtest/the-3-stages-of-playtesting-internal-local-and-blind/)（本文は403で取得できず、タイトルと検索要約のみ確認）
- Jamey Stegmaier（Stonemaier Games）の考え：
  - ブラインドテストの目的は、発売後と同じく「デザイナー抜きでルールから学ぶ」状況を再現し、ルールの穴や分かりにくい箇所を見つけること。ルールに関する質問は、答えがルールに書いてあっても全部重要 — [Stonemaier Games blog（検索要約）](https://stonemaiergames.com/?p=26253)
  - テスト後のアンケートは毎回同じ項目で集める。人数、プレイ時間、勝者・敗者の詳細、評価、良かった点・悪かった点に、ゲーム固有の項目を数個加える — [Stonemaier Games blog（検索要約）](https://stonemaiergames.com/?p=25290)
  - メモは大量に取り、1日寝かせてから処理・修正する — [Stonemaier Games blog（検索要約）](https://stonemaiergames.com/?p=121)
- Stonemaier「Kickstarter Lesson #236: Selecting the Best Testers」(2017) — [stonemaiergames.com/?p=11002](https://stonemaiergames.com/?p=11002)
  - フィードバックは技能であり、上手な10人のほうが下手な100人より価値がある。
  - 良いフィードバックは「何が起きて、なぜそれが問題だったか」を説明している。
  - ルールに書かれていない事態（例：山札切れ）では、テスターが妥当な処理をその場で決めてプレイを続け、後で報告するのが理想。
  - 同じ戦略ばかり使うプレイヤーがいたらテストの価値が下がるので、リードテスター (lead playtester) が別の戦略を試すよう個別に頼む。プレイヤーごとに戦略を割り当てることもある。
  - 「最もイライラした・混乱した点」の欄を空欄で出さない人が良いテスター。
- Scythe は Kickstarter 時点で「750回以上のマルチプレイのブラインドテストと300回のソロのブラインドテスト」を経たと公表 — [Wikipedia: Scythe](https://en.wikipedia.org/wiki/Scythe_(board_game)) / [Gamingtrend](https://gamingtrend.com/news/stonemaier-games-launches-scythe-on-kickstarter)（検索要約経由で、規模を示す参考値）
- 誘導質問はテスターに「デザイナーが望む答え」を言わせてしまう。「その時何を考えていましたか？」のような自由回答式で聞く。質問はプレイ中（直後の反応）とプレイ後（全体の印象・分かりやすさ）の両方で行う — [Schell Games: the definitive guide to playtest questions](https://schellgames.com/blog/the-definitive-guide-to-playtest-questions-for-video-game-playtesters)
- ブラインドテストでルールが正しく伝わったか確かめる方法：テスターに「このコンポーネントは何のためか」「これはいくらか」「このアイコン・マスは何を意味するか」を説明してもらい、意図とのずれを探す — [BGDF forum: how do you know your blind playtesters got it right](https://bgdf.com/forum/game-creation/playtesting/how-do-you-know-your-blind-playtesters-got-it-right)
- 観察型テスト（デザイナーは口を出さずに見る）の重要性を論じた記事 — [Wayline: blind playtests fail / observational testing](https://www.wayline.io/blog/blind-playtests-fail-observational-testing)（業界ブログ）
- 遊び方の観察で「やめるべきメカニクス」が分かった例：コンベンションのテストで、プレイヤーがロールプレイせずシステムの操作ばかりしていたため、その仕組みを削除した — [Gnome Stew: Design Flow – Kill Your Darlings](https://gnomestew.com/design-flow-kill-your-darlings/)

### Inferences
- 観察シートの項目案（上記の資料からの推論）：
  - ルールブックを開いた回数と、その時のページ
  - 長考・手が止まった場面（どの判断で迷ったか）
  - 自分の手番以外でスマホを見る・会話が脱線する（退屈のサイン）
  - 身を乗り出す・声が出る・笑う（盛り上がり）
  - 「もう1回やろう」と自分から言うか
  - 処理を忘れた・間違えた箇所
  - 勝者が決まったと全員が分かったタイミング（以降は消化試合）
- プレイ後の質問案（すべて自由回答式）：
  1. 一番楽しかった瞬間は？
  2. 一番イライラした・混乱した瞬間は？
  3. 自分の勝因・敗因は何だと思う？（戦略の理解度と、運の影響の感じ方が分かる）
  4. もし1つルールを変えられるなら何を変える？（提案された解決策そのものではなく、背後にある「不満」を拾うための質問）
  5. このゲームを友人にどう説明する？
- 友人テストの偏り（気をつかって褒める）への対策：「良かった・悪かった」ではなく「行動」を観察し記録する。毎回同じアンケート項目で数値を残し、版ごとに比べる。

### Gaps
- Stonemaier の「Questions to Ask While Playtesting」系記事の具体的な質問リスト原文は取得できなかった。
- 退屈やボディランゲージの観察について、体系的・学術的な指標は見つからなかった。

---

## 3. バランス手法：コストカーブ、数理モデル、先手有利の測定、陣営別勝率、Elo、相性表 (Matchup Matrix)

### Takeaway
カードやユニットの「数値」の大まかな調整はコストカーブ (cost curve) で行い、外れ値を見つけたら最終的にはプレイテストで検証する。先手有利や陣営間の公平さは「勝率」で定量化する。チェスでも白の勝率は54〜56%程度で、小さな偏りは許容範囲とされる。見るべきなのは「極端な崩れ」である。

### Cited Findings
- **コストカーブの手順（Ian Schreiber「Game Balance Concepts」Level 3）** — [Game Balance Concepts: Transitive Mechanics and Cost Curves](https://gamebalanceconcepts.wordpress.com/2010/07/21/level-3-transitive-mechanics-and-cost-curves/)
  1. すべての効果をコスト（資源・制約・デメリット）と利益に分ける。
  2. 共通の通貨（例：マナ）を1つ決め、すべてをその単位で表す。
  3. コストと利益の関係（線形、逓増、逓減、閾値つき）を設計目標に合わせて決める。
  4. 効果が1つだけのシンプルなカードから値を決める。
  5. 1点だけ違うカード同士を比べ、未知の値を逆算する。確率的・条件付きの効果は割り引く。
  6. 合計して外れ値 (above / below the curve) を探す。
  7. カーブ付近のものをプレイテストで検証する。
  - 例（M2011のクリーチャー）：W3の1/4はコスト6・利益5で、カーブより1低い。
  - 原則：選択式の効果は「良いほうの選択肢」を基準に値付けする。値に迷ったら弱めに作る（弱いカードは使われないだけだが、強すぎるカードはゲーム全体を壊す）。共通メカニクスを変えると全カードの修正が必要になる。
- **Slay the Spire（Mega Crit, GDC 2019, Anthony Giovannetti）**：開発初期から指標重視 (metrics-driven) で、アーリーアクセス期間中ずっとデータを使い続けた。1年目に100万本以上を販売 — [GDC Vault 概要](https://www.gdcvault.com/play/1025731/-Slay-the-Spire-Metrics) / [GDC news](https://gdconf.com/news/learn-slay-spires-successful-metrics-driven-approach-game-balancing-gdc-2019)
  - 全カードのピック率 (pick rate) と勝率を追跡し、Discord とストリーマーの観察も併用した。第一目標は「すべてのカードに居場所がある (every card should have a place)」、第二目標は「強すぎてゲームを歪めるもの (too warping) を避ける」 — [Mechanics of Magic: Critical Play – Is this game balanced?](https://mechanicsofmagic.com/2022/05/22/critical-play-is-this-game-balanced-10/)（講演を聞いた学生のレビュー＝二次資料）
  - つまらないのに少しコストが安すぎるコモンカードは、強さよりも「どこにでも入る（遍在性）」という理由で弱体化の対象になる。めったに出ない強力なレアは許容する。結果としてカードはコストカーブ上では揃っていないが、「面白さのバランス」は取れている — 同上
  - 指標は解釈を誤ると判断を誤らせる、という注意も述べられている — [glasp 講演要約](https://glasp.co/youtube/7rqfbvnO_H0)（二次資料）
- **先手有利と勝率による定式化（Jaffe et al., AIIDE 2012「Evaluating Competitive Game Balance with Restricted Play」）** — [AAAI PDF](https://cdn.aaai.org/ojs/12513/12513-52-16035-1-2-20201228.pdf)
  - 開始条件の公平さは各席の勝率で表せる（チェスの白と黒など）。他の種類のバランスも、何らかの制約を課したエージェントの勝率に置き換えて測る。
    - 「ある行動は強すぎないか」→ その行動を禁じたエージェントと、その弱点を突く相手の勝率を比べる。
    - 「長期戦略寄りか、短期戦術寄りか」→ 目先のスコアだけ最大化する貪欲エージェント (greedy agent) の勝率を見る。
  - 実力が拮抗したチェスでの白の勝率は、実力帯によって54〜56%（Sonas 2012の引用）。囲碁の先番ハンデはどの実力帯でも同じ。バランスは実力差にある程度頑健であり、目的は極端な違反を検出することで、この程度の差は許容範囲とする。
  - AIの指し方は人間の指し方とは一致しない（Hingston 2009）。そのため「プレイの仕方」ではなく「強さ（勝率）」の類似性を利用する、という立場。
  - 事例の教育用カードゲームでは、ある制約をかけたエージェントの勝率が3.4%まで落ちた。著者らはこれを「凡庸なプレイへの罰が厳しすぎる」兆候と解釈した。
- 7 Wonders Duel のAI（ZeusAI）の著者らは、バランスを主に「後手の勝率が50%付近か」と「序盤局面の評価値の分散」で判断した。不思議 (wonder) 選択のバリアントで分散が下がったという。一方で「勝率50/50でも、人間にとって難しい局面でのミスの許容度が非対称ならバランスが取れているとは限らない」という反論もある — [BGA forum: ZeusAI paper](https://forum.boardgamearena.com/viewtopic.php?p=184652)（フォーラム経由）
- BGA のあるゲーム（タイトル不明）の席順別勝率：2人戦で1番手51.7%（29,618試合）、4人戦で26.6%（4,390試合） — [BGA forum: First player advantage?](https://forum.boardgamearena.com/viewtopic.php?p=104883)（対象ゲームは未確認。大量のログから席順有利を測る例として挙げる）
- Hearthstone のバランス研究は「デッキ同士がおおむね同じ強さで対戦できるべき」という単純化した前提を置き、個々のカードではなく「デッキ間の勝率」が揃うようにカードの数値を進化的に調整した — [Evolving the Hearthstone Meta (de Mesentier Silva et al., 2019)](https://arxiv.org/pdf/1907.01623)

### Inferences
- **相性表 (Matchup Matrix)**：陣営・デッキ・キャラクターが N 種類あるなら、N×N の勝率表を作る（シミュレーションで各マス数百〜数千試合）。見るポイント：
  - 平均勝率が突出している行（支配戦略 (dominant strategy)）がないか。
  - 三すくみ (intransitive) 構造が意図どおりにできているか。
  - 席順の影響を除くため、先手後手を入れ替えて対称に集計する。
- **Elo**：対戦ログが多い場合、陣営やデッキを「プレイヤー」に見立てて Elo/TrueSkill を計算すれば強さを1本の軸に並べられる。ただし相性（非推移性）は消えてしまうので、相性表と併用する（今回この用途の一次資料は見つからず、一般的な手法としての推論）。
- 目安：二人用ゲームの先手勝率は、チェス並みの55%前後までは「許容」とするのが妥当な出発点。60%を超えたら補正（後手へのボーナス資源、先手の初手制限など）を検討する（この閾値は推論で、出典なし）。

### Gaps
- 陣営別勝率の業界標準の許容幅（例：45〜55%）を明記した一次資料は見つからなかった。
- Scythe など商業作品の陣営別勝率の公式データは見つからなかった。
- Schreiber & Romero『Game Balance』(2021) の本文は確認できていない。

---

## 4. シミュレーションとAI：ランダムプレイ、MCTS、ドミニオン／ハースストーンのシミュレーター、限界

### Takeaway
AIプレイテストは「露骨な不均衡を早期に見つける警報装置 (early warning system)」として非常に有効だが、人間のテストの代わりにはならない。実際の改善の多くは人間のテストから生まれ、AIはそれを裏付けて判断を速める役割を担う、というのが現時点での研究知見である。

### Cited Findings
- **Goodman, Wallat, Perez-Liebana, Lucas (2023)「A case study in AI-assisted board game design」**：実際のボードゲームの改訂版ごとにAIエージェントでテストした。結論は以下 — [UniversityXP 要約](https://www.universityxp.com/research/2025/7/3/a-case-study-in-ai-assisted-board-game-design)
  - AIテストは人間のテストを補完できるが、置き換えはできない。
  - 設計変更の大半は人間のテストがきっかけだった。
  - AIと人間の結果が一致すると、デザイナーは自信を持って速く変更できた。
  - 鍵となる問題は「AIの結果がどこまで人間らしいと信頼できるか」。
- **TAG (Tabletop Games framework)**：QMUL（Gaina, Balla, Dockhorn, Montoliu, Perez-Liebana, 2020）によるJava製の研究基盤。以下を備え、Python API（PyTAG, 2023）もある — [arXiv 2009.12065](https://arxiv.org/pdf/2009.12065) / [GitHub](https://github.com/GAIGResearch/TabletopGames)
  - AIエージェント共通のAPI
  - JSONでのデータ定義
  - 行動空間 (action space)・分岐数 (branching factor)・隠れ情報などのログ分析
- **Restricted Play（Jaffe et al. 2012）**：MCTSは手作りのヒューリスティックが要らないので、新しい改訂版をデザイナーの手を介さず評価できる。制約（特定の行動の禁止など）を後から組み込みやすい点も利点。AIはトップレベルの人間には届かないが、中程度の強さのプレイでも初期のバランス理解には役立つ — [AAAI PDF](https://cdn.aaai.org/ojs/12513/12513-52-16035-1-2-20201228.pdf)
- **Zook et al. (FDG 2015)**：MCTSの計算量（思考時間）をプレイヤーの実力の代わりとして変化させ、プレイの流れ (playtrace) を生成した — [Zook FDG15 PDF](https://faculty.cc.gatech.edu/~riedl/pubs/zook-fdg15.pdf)
- **Mahlmann, Togelius, Yannakakis (IEEE CEC 2012)「Evolving card sets towards balancing Dominion」**：ドミニオンで使う10種のカードの組み合わせを進化的に探索した。腕前の異なる3種のエージェントと3種の適応度関数 (fitness function) を使い、「実力や行動に関係なくバランスの良いゲームを生む特定のカード」が存在することを発見した — [Univ. of Malta OAR PDF](https://um.edu.mt/library/oar/bitstream/123456789/22933/1/Evolving_card_sets_towards_balancing_dominion.pdf) / [ITU](https://pure.itu.dk/en/publications/evolving-card-sets-towards-balancing-dominion/)
- **ドミニオンのシミュレーターコミュニティ**：Geronimoo's Simulator などで戦略を比較している（例：屋敷を引くカード＋財宝中心の「Big Money」が属州4枚に何ターンで届くか） — [Dominion Strategy Wiki: Simulators](https://wiki.dominionstrategy.com/index.php/Simulators)
  - Geronimoo 本人の記述：「良い Big Money 戦略の多くは14ターンで属州を4枚取れる」 — [Annotated Game #10](https://dominionstrategy.com/2012/02/17/annotated-game-10-geronimoo-vs-wanderingwinder/)
  - シミュレーションの結果例：倉庫/山賊（Warehouse/Mountebank）の開幕は Big Money に94%対5%（引き分け1%）で勝つ — [Dominion Strategy 2011](https://dominionstrategy.com/2011/02/17/annotated-game-1-response/)
  - 「エンジン」デッキは Smithy Big Money に99%勝つ、という記述もある — [Leveling up (2015)](https://dominionstrategy.com/2015/09/06/leveling-up/)
  - Big Money は「基準となるボット (benchmark bot)」として使われている。
  - Python版のシミュレーター（pyminion）もある — [PyPI pyminion](https://pypi.org/project/pyminion/0.1.4)
- **SabberStone**：C#製のコミュニティ版ハースストーンシミュレーター。研究に使われている — [GitHub mirror](https://github.com/s13n4/SabberStone) / [The Many AI Challenges of Hearthstone](https://arxiv.org/pdf/1907.06562)
  - 新カードの実務的な検証法：その新カードを含むデッキを探索し、強すぎるデッキが見つかれば弱体化する — [The Many AI Challenges of Hearthstone](https://arxiv.org/pdf/1907.06562)
  - デッキ空間を MAP-Elites で地図化した研究：ハースストーンは対戦前にデッキを組み、ドミニオンはプレイ中にデッキを組む、という構造の違いを指摘 — [arXiv 1904.10656](https://arxiv.org/pdf/1904.10656)
- **Risk の進化的デザイン（Rossato et al., SBGames 2023）**：素朴なMCTSは Risk では遅すぎるか、短時間では悪手を返すため、手作りのルールベースエージェントでテストした。適応度は良いが、マップが極端に小さい「ほぼ自明なゲーム」が多く生成されたことを限界として挙げている — [arXiv 2310.20008](https://arxiv.org/pdf/2310.20008)
  - つまり、指標を最適化させると、指標上は良いのに中身のないゲームができることがある（目的関数の抜け道を突かれる、いわゆる specification gaming）。
- AIの指し方は人間の指し方を予測しない。戦略の多様な複雑なゲームでは、強いAIでも人間らしくは振る舞わない — [Jaffe et al. 2012](https://cdn.aaai.org/ojs/12513/12513-52-16035-1-2-20201228.pdf)

### Inferences
- **シミュレーションで分かること**：
  - 席順の有利不利
  - 陣営・デッキの勝率と相性表
  - 支配戦略やコンボの有無（制約付きエージェントで測る）
  - ゲームの長さの分布
  - 無限ループやデッキ切れなどルールの穴（ランダムボットでも見つかる）
  - 運と実力の比率（強いボット対ランダムボットの勝率）
- **シミュレーションで分からないこと**：
  - 楽しさ、緊張感、テーマ性
  - ルールの分かりやすさ
  - ダウンタイムの体感
  - 人間特有のミスや心理（キングメイキング、空気を読む等）
  - 「人間が発見しやすい戦略」と「AIが見つける戦略」のずれ
- **AIアシスタントと進める段階案**：
  1. ルールをコード化する（これ自体がルールの曖昧さを洗い出す）。
  2. ランダムボットで数万試合回し、クラッシュ、終わらないゲーム、極端な試合長を検出する。
  3. 貪欲ボット／ヒューリスティックボット（ドミニオンの Big Money のような単純な基準戦略）で、陣営別勝率と先手勝率を出す。
  4. 時間があれば MCTS（思考回数を変えて実力の代わりにする）で、実力の差が勝率に反映されるか（スキル表現 (skill expression)）を確かめる。
  5. 外れ値だけを人間のテストに回す。
- シミュレーションの結果はあくまで「仮説」とし、人間のテストで一致したときだけ確信度を上げる（Goodman et al. の知見と同じ考え方）。

### Gaps
- Slay the Spire 講演の具体的な閾値や数値（何%のピック率で調整するか等）は、GDC Vault が会員限定のため取得できなかった。
- Metastone の現状（開発継続の有無）は未調査。
- 大規模言語モデル (LLM) をプレイヤーとしてテストに使う最新研究は、今回の範囲では確認できなかった（Perez-Liebana の研究対象にLLMが含まれることのみ確認：[diego-perez.net CV](https://diego-perez.net/cv/)）。

---

## 5. 指標：ゲームの長さ、判断回数、首位交代 (Lead Changes)、逆転 (Drama)、点差など

### Takeaway
研究では、首位交代・ドラマ（逆転の可能性）・決定的な一手 (killer moves)・分岐数・先手有利・試合長などを自己対戦 (self-play) から測っている。首位交代は「少なすぎると退屈、多すぎると運任せでカオス」なので、中間（正規化して約0.5）を目標にする例がある。好まれるゲームは「長すぎない手数で終わり」「最後まで勝者が分からない」傾向がある、という調査もある。

### Cited Findings
- Browne は100人以上に79種のゲームをランク付けしてもらい分析した。好まれたゲームは妥当な手数で終わり、最終勝者の不確実性 (uncertainty) が高かった — [The Engineer: good game](https://theengineer.co.uk/content/news/good-game) / [Opinionated Gamers: Browne's "Automatic generation and evaluation of recombination games"](https://opinionatedgamers.com/2018/04/23/james-nathan-cameron-brownes-automatic-generation-and-evaluation-of-recombination-games/)
- ドラマ (Drama) は「劣勢のプレイヤーが勝つ可能性」。Thompson の提案を Browne が二人用ゲームとして定式化した。のちに多人数ゲームに拡張され、数百万試合のシミュレーションの統計で測られている（例：すごろく、ビジネスゲーム） — [ABSEL: Drama Measures Applied to a Large Scale Business Game](https://absel-ojs-ttu.tdl.org/absel/article/view/3062)
- 自己対戦から測るゲームの質の指標として、以下が挙げられている — [Foundations of Digital Archæoludology (arXiv 1905.13516)](https://arxiv.org/pdf/1905.13516)
  - ドラマ（逆転の可能性）
  - 不確実性（大半の時間、結果が読めない）
  - 決定性 (decisiveness)（勝負がついているのに長く続くゲームはつまらない）
  - 戦略の深さ
- Risk の研究での指標の定義と目標値 — [Rossato et al. arXiv 2310.20008](https://arxiv.org/pdf/2310.20008)
  - **首位交代 (Lead change)**：ターンごとの首位が前ターンと違った回数。交代しないと退屈で、多すぎると予測不能・カオスになる。
  - **ドラマ**：負けているプレイヤーが形勢を逆転できる見込み。勝ち目がない（ドラマが低い）と、プレイヤーにとって面白くなくなる。
  - **決定的な一手 (Killer moves)**：形勢を一気にひっくり返す手。
  - **先手有利 (Advantage)**：先手への偏り。
  - **分岐数 (Branching factor)**、**完了率 (Completion)**、**試合長 (Duration)**
  - 目標値（正規化後）：分岐数・ドラマ・killer moves・首位交代はいずれも0.5、完了率は1（引き分けなし）。
  - 結果：マップを小さくした変種は試合が短くなり、ドラマを保ったままバランスが改善した。
- Jaffe et al. は、強いAIと弱い（制約付き）AIの勝率差で「実力がどれだけ結果に反映されるか」を測る考え方を示している — [AAAI PDF](https://cdn.aaai.org/ojs/12513/12513-52-16035-1-2-20201228.pdf)

### Inferences
- 個人開発で実用的な指標セット（シミュレーターに全部ログ出力させる）：
  1. 試合長（ターン数・分）の平均と分散
  2. 1ターンあたりの合法手数（分岐数。少ないと選択がない、多すぎると長考の原因）
  3. 席順別勝率
  4. 陣営・デッキ別勝率と相性表
  5. 首位交代回数
  6. 逆転率：中盤（例：試合の50%時点）で最下位／劣勢だった側が勝った割合
  7. 最終点差の分布（毎回大差なら逆転要素や追い上げの仕組みを検討）
  8. 強いボットと弱いボットの勝率（運と実力の比率）
  9. 各カードの採用率・ピック率と、それを採用したときの勝率（Slay the Spire 方式）
- 目標値は「中間が良い」タイプの指標が多い（首位交代、ドラマ、運の比率）。ターゲット層（カジュアル向けなら逆転を多め、競技向けなら実力の反映を多め）に応じて目標を決めてから測るべき。
- 具体的な数値目標（例：「首位交代は1試合2〜4回」「逆転率20〜35%」）について、商業デザイナーが公表した基準は見つからなかった。決めるなら自作の基準として明示すること。

### Gaps
- 判断回数 (decision count) や「意味のある判断の割合」を測る確立された方法は見つからなかった。
- Browne の論文原文（指標の正確な数式）は未取得。

---

## 6. よく使われる経験則：「表計算ではなくプレイテストでバランスを取る」「最大の問題から直す」「足す前に削る」「一度壊してから戻す」

### Takeaway
数理モデル（コストカーブやシミュレーション）は出発点と外れ値検出に使い、最終判断はプレイテストで行う、という点で各資料はほぼ一致している。削除は追加より効果が大きいことが多い。投じた手間 (sunk cost) に惑わされず、仕組みを一時的に外して比べる「除去テスト」が有効である。

### Cited Findings
- Schreiber：コストカーブは「最後はプレイテストで検証」が前提。新作のカーブは推測が難しいので大量のプレイテストを計画せよ。迷ったら弱めに作る — [Game Balance Concepts Level 3](https://gamebalanceconcepts.wordpress.com/2010/07/21/level-3-transitive-mechanics-and-cost-curves/)
- Slay the Spire：バランスは目的ではなく、狙った体験のための手段。カード単体ではなく、文脈（どの戦略で使えるか、どれだけ出会うか）で評価する。各カードを個性的にして戦略が自然に重なり合うようにし（いわゆる "fruity" な手法）、数値の横並び調整 (transitive balancing) は必要なときだけ行う — [Mechanics of Magic](https://mechanicsofmagic.com/2022/05/22/critical-play-is-this-game-balanced-10/)
- 仕組みを外してみて、ルールが減っても効果の大半が残るなら削る。良くならなければ戻し、別のものを外す。削ることは足すことよりゲームを良くする場合が多い — [Quirkworthy (Jake Thornton): How to fix a design that isn't working (2026)](https://quirkworthy.com/2026/03/20/how-to-fix-a-design-that-isnt-working/)
- 仕組みを残してしまうのは、プレイヤー体験のためではなく、注いだ時間と情熱のため（サンクコスト）であることが多い — [Wayline: abandoning core mechanics](https://www.wayline.io/blog/abandoning-core-mechanics-save-your-game)
- 「複雑さは深さではない」「答えが明らかな選択は選択ではない」などの格言 — [playbooks.com skill directory](https://playbooks.com/skills/omer-metin/skills-for-antigravity/board-game-design)（AIエージェント向けスキル集＝権威の低い二次資料）
- Stegmaier：メモは1日寝かせてから処理する（その場の感情で直さない） — [Stonemaier blog（検索要約）](https://stonemaiergames.com/?p=121)

### Inferences
- 「一度壊してから戻す (make it broken then pull back)」：数値を極端に振ってみてから中間に戻すと、適正値の範囲が早く見つかる。シミュレーションなら、パラメータ掃引 (parameter sweep) で一度に全範囲を試せる。ただし今回、この格言の明確な一次出典は見つからなかった。
- 「最大の問題から直す」：一度に1〜2か所だけ変えないと、どの変更が効いたか分からない。変更履歴とテスト結果を版番号つきで記録する。

### Gaps
- "Balance via playtesting not spreadsheets" / "fix the biggest problem first" / "make it broken then pull back" という言い回しの、特定デザイナーによる一次出典は確認できなかった。
- Daniel Solis、Cardboard Edison、League of Gamemakers の該当記事は、今回の検索では見つからなかった。

---

## 7. 【追加範囲】4人用ゲームのテストとバランス：席順の有利不利、人数別テスト、多人数ボット (Paranoid / Max-n)、キングメイキングの検出、4人戦の指標

### Takeaway
4人戦では「公平な勝率」が25%になり、席順の影響は2人戦より大きく出やすい。大規模データでは1番席が約29〜31%、4番席が約20〜22%で、両端の差は数ポイント規模。ただしゲームによっては2番席が最も有利という逆の例もあるため、必ず自作ゲームで測る必要がある。多人数用のAIは、「各自が自分の得点を最大化する」Max-n（MCTS版）を基本にし、「全員が自分を潰しに来る」と仮定する Paranoid と比べると、リーダー叩きやキングメイキングへの耐性を調べられる。キングメイキングを自動で検出する確立された方法は見つからなかったが、René Wiersma の「3条件」が観察・計測のチェックリストとして使える。

### Cited Findings
**席順の有利不利 (Seat / Turn-order advantage)**
- MTG統率者戦 (Commander) の4人卓約24.4万試合（単独勝者）での席別勝率：1番席29.2%、2番席25.7%、3番席23.6%、4番席21.5%（公平値25%）。席が後になるほど単調に下がり、長い試合でも差は残る — [Playgroup.gg: Commander Turn Order](https://playgroup.gg/commander/turn-order)（自己申告の記録データで、無作為標本ではない）
- cEDH（競技版統率者戦）の大会648卓の分析：1番席31.5%、4番席20.2%。95%信頼区間で25%と統計的に区別できる — [Topdeck.gg: first player advantage](https://topdeck.gg/articles/first-player-adv-silicon-dynasty)（個人による分析）。関連記事：[EDHREC: Does cEDH Have a Seat Order Problem?](https://edhrec.com/articles/does-cedh-have-a-seat-order-problem)
- アグリコラ（BGAのデータ, 2022）：最後の席は得点・勝率ともに明確に不利。3〜4人戦では1番席より2番席のほうが成績が良い。開始時のEloの差では説明できない — [BGA forum: Agricola Statistics Update Apr–Sep 2022](https://forum.boardgamearena.com/viewtopic.php?p=127163)
- アグリコラの4番席の補正案（BGAフォーラム）：
  - 1ラウンド目だけ逆順 (snake) で手番を回す
  - 同点の場合は4番席の勝ち（WBC大会ルールで採用済みとされる）
  - 4番席に初期食料+1
  - いずれも議論・提案の段階で、勝率データはそのページにはない — [BGA forum: 4th seat compensation](https://forum.boardgamearena.com/viewtopic.php?p=229144)
- BGAの別ゲーム（タイトル不明）：4人戦4,390試合で1番席26.6% — [BGA forum: First player advantage?](https://forum.boardgamearena.com/viewtopic.php?p=104883)

**人数ごとのテスト (Player-count scaling)**
- 人数は手番の長さ、資源の配分、ゲームの流れに影響する。プレイ時間の長期化、戦略の偏り、開始位置の不公平といった問題が起きうる。対策は、人数ごとに資源・盤面サイズ・得点・ゲーム長を調整すること — [Brain Games: How player count impacts game design](https://brain-games.com/blogs/board-game-explorer/how-player-count-impacts-game-design)（小売店のブログ）
- 待ち時間の見積もり：1手番2分なら、6人戦では自分の番が回ってくるまで約10分待つ。対策は同時行動、手番の簡素化、他人の手番中にも参加できる仕組み。カルカソンヌのように人数に依存しない終了条件（タイルが尽きたら終了）も有効 — 同上 / [BGDF: how many players](https://www.bgdf.com/forum/archive/archive-game-creation/game-design/how-many-players)
- 「N人に対応している」と「N人用に設計されている」は違う。人数ごとに専用の調整をする — [Brain Games](https://brain-games.com/blogs/board-game-explorer/how-to-adjust-board-game-setup-for-2-6-players)
- 新人デザイナーの例：ほぼ完成するまで4人戦を大量に回し、その後で少人数向けに調整していった — [Zatu: First Time Designer #17](https://zatu.com/first-time-designer-17-2/)
- 人数が多い作品のバランスやテスター集めについて：[Board Game Design Lab: Darren Terpstra](https://boardgamedesignlab.com/designing-games-with-higher-player-counts-with-darren-terpstra/)
- 人数が増えるほど混沌とし、プレイヤー1人ごとにランダム性が1段増える、という指摘 — [BGDF: how many players](https://www.bgdf.com/forum/archive/archive-game-creation/game-design/how-many-players)

**多人数用のAIボット (Max-n / Paranoid / Best-Reply Search / MCTS)**
- Max-n（Luckhardt & Irani 1986）：各プレイヤーが自分の評価値を最大化すると仮定する。Paranoid（Sturtevant & Korf 2000）：他の全員が結託して自分を最小化すると仮定する。Paranoid は枝刈りが効くが、仮定が誤っていることが多く、守りに入りすぎる — [Nijssen & Winands: An Overview of Search Techniques in Multi-Player Games](https://dke.maastrichtuniversity.nl/m.winands/documents/Multi_Overview.pdf)
- Sturtevant (2002) の比較：
  - ダイヤモンドゲーム (Chinese Checkers) では Paranoid が大きく勝ち、ハーツでは小差で勝ち、スペードでは互角。
  - Max-n では同点時の扱い (tie-breaking) が決定的に重要 — [Sturtevant 2002](https://cs.du.edu/~sturtevant/papers/sturtevant2002comparison.html)
- Best-Reply Search (BRS)：「自分を妨害するのは相手のうち1人だけ」と仮定する。αβ系の手法では総じて最良 — [Best-Reply Search PDF](https://dke.maastrichtuniversity.nl/m.winands/documents/BestReplySearch.pdf)
- MCTSに Max-n / Paranoid / BRS の方針を組み込んで比較した研究（Nijssen & Winands, ICGA Journal 2013、完全情報の4ゲーム）：
  - 総合では Max-n 方針のMCTSが最良だった。MCTSにはαβ枝刈りがないため、Paranoid や BRS の利点が活きない。
  - 対象は特定のゲーム（Chinese Checkers, Focus, Rolit, Blokus）なので、他のゲームへの一般化には注意 — [ICGA Journal](https://content.iospress.com/articles/icga-journal/icg36102) / [Maastricht CRIS](https://cris.maastrichtuniversity.nl/portal/en/publications/search-policies-in-multiplayer-games(3835680f-afad-4008-ba14-f1c1bfa9a126).html)

**キングメイキング (Kingmaking) と関連する問題**
- 定義：負けが確定したプレイヤーが、残りの誰を攻撃するかなどで勝者を事実上決めてしまうこと。失望感や主体性 (agency) の喪失を生み、場の空気を悪くする — [Skeleton Code Machine: Solving the three-player problem](https://www.skeletoncodemachine.com/p/three-player-problem)
- 関連する問題：
  - 引きこもり (turtling)：守りに徹して争いに参加しない
  - リーダー叩き (leader bashing)：首位の人を全員で攻撃する
  - 実力隠し (sandbagging)：自分の好調を隠す
  - 対策：勝利点を非公開にする、相互作用を減らす、脱落制、特定の1人を狙い撃ちしにくくする（各行動が少しずつ、複数人に影響する形にする）
  - 「グループ全体の目標や決定が主眼のゲームなら、キングメイキングは問題ではない」という見方もある — 同上 / [Is kingmaking cursed?](https://www.skeletoncodemachine.com/p/is-kingmaking-cursed)
- 最悪のキングメイキングの3条件（René Wiersma, BGDF）。どれか1つを崩せば影響は減る：
  1. そのプレイヤーの手が、他のプレイヤー間の勝敗を決める
  2. どの手を選んでも、本人の順位は改善しない
  3. 本人がそれを自覚している — [BGDF: TIGD – Kingmaking common problem](https://bgdf.com/forum/archive/archive-game-creation/topics-game-design/tigd-kingmaking-common-problem-2)
- 競争型のレースゲーム（Xに到達したら勝ち）は、勝者決定が全か無かになるのでキングメイキングが起きやすい — 同上
- Alex Jaffe（GDC 2019「Cursed Problems」）は、キングメイキングを「直せない問題」の一つとし、ゲームを根本から変えて回避するしかないと位置づけた（検索要約経由） — [Skeleton Code Machine: Is kingmaking cursed?](https://www.skeletoncodemachine.com/p/is-kingmaking-cursed)
- 3人戦では、首位を止めるための一時的な同盟が自然に生まれる。こうした同盟の形式的研究は結論が出ておらず、何が「合理的」なプレイかを形式的に定義するのが難しい。2位を決めてしまう「プリンスメイキング (princemaking)」という現象もある — [Ithaca College paper](https://ithaca.edu/file-download/download/public/71183)
- 首位を逆転できなくなったら退屈になるため、首位交代やドラマは多人数ゲームでも中心的な指標になる（Risk の研究では2人用の設定で定義） — [Rossato et al. arXiv 2310.20008](https://arxiv.org/pdf/2310.20008)

### Inferences
- **4人戦のシミュレーション設計案**（AIアシスタントに実装させる）：
  1. **席の回転 (seat rotation)**：同じ組み合わせの陣営・ボットを、4席すべて（理想は4! = 24通りの並び）で回し、席の効果と陣営の効果を分けて集計する。
  2. **基準ボットの種類**：
     - ランダムボット
     - 貪欲ボット (greedy)
     - Max-n型（自分の得点を最大化）のMCTS
     - Paranoid型（自分以外の合計を最小化）
     - リーダー叩き型（首位の得点を下げる手を優先）
     - 組み合わせの例：Max-n ×4（基準）、Max-n ×3＋リーダー叩き ×1、全員リーダー叩き
     - 卓の構成によって勝率や首位交代がどう変わるかを見る。リーダー叩きだけで首位交代が激増するなら、ゲームは「叩き合い」に依存している。
  3. **キングメイキングの自動検出（Wiersma の3条件をコード化）**：終盤の各局面で、ほぼ確実に負けているプレイヤー（例：MCTSでの勝率推定が5%未満）について、選べる手ごとに残り3人の勝率を推定する。
     - 条件1：手によって「誰が勝つか」の分布が大きく変わる（例：最有力者の勝率が手ごとに20ポイント以上ずれる）
     - 条件2：本人の勝率・順位はどの手でもほぼ同じ
     - 両方を満たす局面を「キングメイク局面」として数え、1試合あたりの発生率を指標にする。閾値は推論による仮置き。
     - 条件3（自覚）は、情報が公開されているかどうかで代わりに判定する。得点を非公開にすれば自覚しにくくなる。
- **4人戦で追加する指標**：
  - 席別勝率（公平値25%）と、席別の平均順位・平均得点
  - 2番手・3番手の「惜しさ」（1位との点差の分布）
  - 首位交代回数と、最終ラウンド直前の首位が最終的に勝った割合
  - 脱落・事実上の脱落（勝率推定が一定値未満になった時点から終了までの手番数＝「消化試合の長さ」）
  - 手番間の待ち時間（1手番の平均時間×3）
  - キングメイク局面の発生率
- **サンプル数の目安**（二項分布での推論）：4人戦の席別勝率（p≈0.25）を±2ポイント（95%信頼区間）で測るには、各席あたり約1,800試合が必要（1.96×√(0.25×0.75/n) ≈ 0.02 から計算）。人間のテストでは数十試合しかできないため、席順の有利不利は人間のテストではほぼ検出できない。シミュレーションに任せるのが現実的。
- **人数別テストの順序案**：デザインの中心となる人数（今回は4人）で核を固める → 2人・3人の調整（盤面サイズ、ダミープレイヤー、資源量）→ 各人数で席別勝率と試合時間をシミュレーションと人間のテストの両方で確認する。3人戦は「2人が組んで1人を叩く」形になりやすいので、別途観察する（Ithaca の論文、Skeleton Code Machine）。
- **席順補正の選択肢**（アグリコラの議論より）：
  - 後の席ほど初期資源を多くする
  - 1ラウンド目を逆順 (snake) にする
  - 同点時は後の席を勝ちにする
  - 調整したら、補正後の席別勝率を再度シミュレーションで確認する。補正の目標値（例：全席が25%±2ポイント）はデザイナー自身が決める基準で、業界で決まった数字ではない。

### Gaps
- 4人用ボードゲーム（統率者戦以外）で、席別勝率を大規模に公開・分析した一次資料は少ない。アグリコラの具体的な席別勝率の数値は今回取得できなかった。
- キングメイキングを自動検出する学術的な手法は見つからなかった（上記は推論による設計案）。
- 4人戦の首位交代やドラマの目標値を定めた資料は見つからなかった。

---

## 付録：資料から組み立てた段階的プレイブック（推論による統合）

1. **問いを決める**：「このゲームの核となる体験は何か」「今回のテストで確かめる問い」を1行で書く（Schell の原則より）。
2. **紙で最小限のゲームを作る**：手書きで、壊れる前提で。自分1人で全員分を動かすソロテストで、最後まで回るまで直す（Entro Games）。
3. **カードとルールをデータ化する**：CSV/JSONにしてAIアシスタントがシミュレーター化する。この時点でランダムボットによる健全性チェック（無限ループ、終わらない試合）を行う。
4. **コストカーブを引く**：共通の通貨でカードを値付けし、外れ値に印をつける（Schreiber）。迷ったら弱めに。
5. **友人とのローカルテスト**：デザイナーは観察役に徹し、行動を記録する。毎回同じアンケートを使う（Stonemaier）。質問は自由回答式で（Schell Games）。
6. **改訂**：最大の問題を1つ選び、「削る」選択肢を最初に検討する（Quirkworthy）。メモは1日寝かせる。
7. **シミュレーションでバランスを見る**：席順別勝率（目安：チェス並みの54〜56%は許容）、陣営の相性表、制約付きエージェントによる支配戦略の検出（Jaffe）、首位交代とドラマ（Rossato、目標は中間）、カードの採用率と勝率（Slay the Spire）。
8. **人間とAIの結果を突き合わせる**：一致すれば速く変更し、食い違えば人間側を優先して原因を調べる（Goodman et al. 2023）。
9. **ブラインドテスト**：ルールブックだけで遊んでもらい、ルールに関する質問はすべてルールの修正点として扱う。コンポーネントの意味を説明してもらい、理解のずれを探す（Stonemaier、BGDF）。
10. **5〜9を繰り返す**：版番号・変更点・指標を記録し続ける。
