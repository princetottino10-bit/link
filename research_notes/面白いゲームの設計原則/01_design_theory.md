# ゲームの「面白さ」を説明する主要な設計理論（カードゲーム・ボードゲーム。当初は2人対戦中心、スコープ変更により4人プレイへの示唆を第10節に追加）

> 注記：スコープ変更（4人ゲーム）を受け、第1〜9節の2人対戦向け Inferences は「2人の場合」の参考として残し、4人向けの総合的示唆は第10節にまとめた。一次資料を直接読めたのは MDA 論文（PDF全文）、Rosewater の Lenticular Design 記事、Game Developer の Sid Meier GDC2012 講演レポート。Koster・Costikyan・Garfield らの書籍本文は入手できず、出版社紹介・書評・目次などの二次情報に頼っている。各項目の「Inferences」は筆者（調査者）による設計上の解釈であり、出典つきの事実とは分けて記載した。

## 1. MDA フレームワーク（Hunicke, LeBlanc, Zubek）：8種類の楽しさと Mechanics → Dynamics → Aesthetics

### Takeaway
MDA はゲームを「メカニクス（ルール）→ダイナミクス（プレイ中に生じる振る舞い）→エステティクス（プレイヤーの感情反応）」の3層で捉える。デザイナーは M から、プレイヤーは A から体験するので、「狙う感情（A）を先に決め、それを生むダイナミクスを考え、最後にメカニクスで実装・調整する」という体験駆動の設計手順が導ける。

### Cited Findings
- 定義：メカニクス（Mechanics）＝データ表現・アルゴリズムのレベルでのゲームの構成要素。ダイナミクス（Dynamics）＝メカニクスがプレイヤー入力や互いの出力に作用して時間経過で生じる実行時の振る舞い。エステティクス（Aesthetics）＝プレイヤーがゲームシステムと関わるときに呼び起こされる望ましい感情反応 — [MDA paper (Hunicke, LeBlanc, Zubek 2004)](https://users.cs.northwestern.edu/~hunicke/MDA.pdf)
- 視点の非対称：デザイナーにとってはメカニクスがダイナミクスを生み、それが美的体験に至る。プレイヤーにとってはエステティクスが「トーン」を決め、それが観察可能なダイナミクス、最終的に操作可能なメカニクスとして現れる。プレイヤー視点を考えることは「機能駆動ではなく体験駆動（experience-driven）」の設計を促す — [MDA paper](https://users.cs.northwestern.edu/~hunicke/MDA.pdf)
- 「fun」「gameplay」という曖昧な語から離れるための8分類（網羅ではないと明記）：
  1. 感覚（Sensation）＝感覚的快楽としてのゲーム
  2. 空想（Fantasy）＝ごっこ遊び（make-believe）としてのゲーム
  3. 物語（Narrative）＝ドラマとしてのゲーム
  4. 挑戦（Challenge）＝障害物コースとしてのゲーム
  5. 仲間意識（Fellowship）＝社会的枠組みとしてのゲーム
  6. 発見（Discovery）＝未踏の地としてのゲーム
  7. 表現（Expression）＝自己発見としてのゲーム
  8. 服従／暇つぶし（Submission）＝気晴らし（pastime）としてのゲーム
  — [MDA paper](https://users.cs.northwestern.edu/~hunicke/MDA.pdf)
- 例：ジェスチャー（Charades）＝Fellowship・Expression・Challenge（挑戦より仲間意識を重視）。Quake＝Challenge・Sensation・Competition・Fantasy。ゲームは複数の美的目標を異なる比率で追求し、「面白さの公式」は存在しない — [MDA paper](https://users.cs.northwestern.edu/~hunicke/MDA.pdf)
- 競争的ゲームの要件：プレイヤーが互いを打ち負かすことに感情的に投資していること。そのため「敵対的プレイの支持」と「誰が勝っているかの明確なフィードバック」が不可欠。勝利条件が見えない、あるいは勝てないと感じると、ゲームは急に面白くなくなる — [MDA paper](https://users.cs.northwestern.edu/~hunicke/MDA.pdf)
- ダイナミクスがエステティクスを作る例：挑戦は時間的圧力（time pressure）や対戦相手のプレイから生まれる。仲間意識はチーム内での情報共有や単独では達成困難な勝利条件から。表現は購入・構築・獲得・カスタマイズの仕組みから。劇的緊張（dramatic tension）は「緊張の高まり→解放→結末（denouement）」を促すダイナミクスから生まれる — [MDA paper](https://users.cs.northwestern.edu/~hunicke/MDA.pdf)
- フィードバックループの例（モノポリー）：リーダーは富むほど他者をより効果的に罰し、貧者はさらに貧しくなる。差が開くと、投資しているのは少数（時に1人）だけになり「劇的緊張とエージェンシーが失われる」。対策として、遅れたプレイヤーへの補助（subsidies）／リーダーへの課税（taxes）、あるいは時間的圧力を加えて決着を早める（一定率の課税、独占の支払い倍増、低額物件のランダム配布）を提案 — [MDA paper](https://users.cs.northwestern.edu/~hunicke/MDA.pdf)
- 調整（Tuning）の注意：補正税の計算が複雑すぎると、プレイヤーが自分の進捗・順位を追えなくなり投資感を損なう — [MDA paper](https://users.cs.northwestern.edu/~hunicke/MDA.pdf)
- カードゲームのメカニクス（シャッフル、トリックテイキング、ベッティング）からブラフ（bluffing）というダイナミクスが生じる、という例示 — [MDA paper](https://users.cs.northwestern.edu/~hunicke/MDA.pdf)

### Inferences
- 2人対戦カードゲーム設計への手順化：①狙う A を2〜3個に絞る（例：Challenge＋Discovery＋Expression）→②それを生む D を言語化（例：「相手の手を読み合う」「デッキ構築で個性が出る」）→③D を生む最小の M を作る→④テストプレイで A が実際に出ているか観察して M を調整、というループ。
- 2人対戦では「勝敗の見通しが明確だが確定しない」状態の維持が最重要（MDA の「誰が勝っているかの明確なフィードバック」＋「勝てないと感じると面白くなくなる」）。正のフィードバックループ（雪だるま）が強すぎる場合は、補正・タイマー（ゲーム終了圧力）のどちらかで対処する。
- 補正メカニクスは「計算しやすさ」とのトレードオフ。順位把握を阻害しない単純な補正が望ましい。

### Gaps
- 8分類は2004年の原論文のもの。後年 LeBlanc 自身が拡張・修正した分類（例えば Competition を加えたもの）があるかは未確認（論文内の Quake の例には8分類にない「Competition」が登場しており、分類が網羅的でないことを示唆）。
- MDA への批判（例：DPE、MDA の一方向性への批判）は今回未調査。

## 2. Raph Koster『A Theory of Fun for Game Design』：楽しさ＝学習／パターン習得

### Takeaway
Koster は「楽しさ」をパターン認識・学習の快楽として捉える。パターンを習得しきると退屈になるため、長く遊ばれるゲームには習得し尽くせない深さ（新しいパターンの連続供給）が必要で、三目並べのように「解けた」ゲームは飽きられる。

### Cited Findings
- 書評による要約：Koster は学習をパターン認識として捉え、人は知覚したもののパターンを見つけることを楽しむ。パターンを発見し終えると退屈し、新しい挑戦を求める。よって、そうした挑戦を連続的に提供できるゲームは（何かを教えてくれるので）楽しい — [Tale of Tales review (2006)](https://www.tale-of-tales.com/DramaPrincess/wp/?p=120)
- Koster は簡単すぎるゲームでも難しすぎるゲームでも退屈を経験したと述べる。出版社紹介は「なぜあるゲームはすぐ退屈になり、別のゲームは何年も楽しいのか」を本書の問いとして掲げる — [Tale of Tales review](https://www.tale-of-tales.com/DramaPrincess/wp/?p=120); [O'Reilly book description](https://oreilly.com/library/view/theory-of-fun/9781449363208)
- 子どもは言語習得前からゲームを学習道具として使い、三目並べ（tic-tac-toe）のような単純なゲームでパターンを見つける — [Tale of Tales review](https://www.tale-of-tales.com/DramaPrincess/wp/?p=120)
- 出版社紹介：ゲームは人間の生得的なパターン探索・パズル解決の能力に働きかける — [O'Reilly book description](https://oreilly.com/library/view/theory-of-fun/9781449363208)
- Costikyan の「不確実性」と Koster の「パターン認識」は矛盾ではなく表裏一体である、という評者の見解 — [Liz England review of Uncertainty in Games](https://lizengland.com/blog/review-uncertainty-in-games-by-greg-costikyan/)
- 批判：Ian Bogost は『Unit Operations』第8章で「楽しさ」をゲームの主目的とする Koster の姿勢を批判 — [Tale of Tales review（検索結果要約より）](https://www.tale-of-tales.com/DramaPrincess/wp/?p=120)

### Inferences
- 設計上の含意：
  - 「習得し切れる」＝「解ける」ゲームは寿命が短い。2人対戦では、相手という可変要素（読み合い）や、組み合わせ爆発（カードプール、盤面状態）でパターン空間を広げる。
  - 学習曲線を段階化する：最初のパターン（基本ルールで得をする方法）はすぐ見つかり、次のパターン（コンボ、相手の読み、タイミング）が後から現れるようにする（→ Rosewater の lenticular design と整合）。
  - 「難しすぎ」も退屈になるので、最初の数ゲームで「わかった！」体験（小さなパターン発見）を確実に起こす。
- 支配戦略（dominant strategy）は「習得完了したパターン」と同義で、発見された瞬間に面白さが消える。テストプレイでは支配戦略探しを最優先にする。

### Gaps
- Koster 本人の原文（「fun is just another word for learning」等の正確な表現、chunking の説明）は直接確認できなかった。raphkoster.com の書籍ページは 404。

## 3. Sid Meier「ゲームとは興味深い決定の連続である」と関連理論（Burgun など）

### Takeaway
「興味深い決定」とは、トレードオフがあり、状況依存で、プレイスタイルを表現でき、結果が持続し、十分な情報とフィードバックの下で行われる決定である。Burgun はさらに「よりよい答えが曖昧（ambiguous）であること」を強調する。

### Cited Findings
- Meier（GDC 2012）は「面白くない決定」から定義：3択で常に1番目を選ぶ、あるいはランダムに選ぶしかない決定は面白くない — [Game Developer: GDC 2012 Sid Meier](https://www.gamedeveloper.com/design/gdc-2012-sid-meier-on-how-to-see-games-as-sets-of-interesting-decisions)
- 興味深い決定の要素（Meier）：
  - トレードオフ（Tradeoffs）：良い選択には代償がある（大剣は500ゴールド、最速の車は操作性が悪い）
  - 状況依存（Situational）：「良い決定は状況的である」。最善手はゲーム状況で変わる
  - 個人的表現（Personal expression）：慎重派は守り、攻撃派は攻撃ユニット。プレイスタイルを表現できる
  - 持続性（Persistence）：長く影響する決定があり、序盤の選択が後半を台無しにしないよう注意が必要
  - リスク対リターン（Risk vs reward）
  - 短期対長期の見返り（Short- vs long-term）：遺産（wonder）は時間がかかるが長期に大きい、戦車は早いが影響小
  — [Game Developer](https://www.gamedeveloper.com/design/gdc-2012-sid-meier-on-how-to-see-games-as-sets-of-interesting-decisions)
- 情報に基づく選択（Informed choices）：プレイヤーは選択肢を理解している必要があり、「情報は多すぎる側に倒せ」。ジャンルの慣習や歴史的テーマ（チンギス・ハンは攻撃的だろう）など既知の知識を活用 — [Game Developer](https://www.gamedeveloper.com/design/gdc-2012-sid-meier-on-how-to-see-games-as-sets-of-interesting-decisions)
- フィードバック：決定への最悪の反応は「無反応」 — [Game Developer](https://www.gamedeveloper.com/design/gdc-2012-sid-meier-on-how-to-see-games-as-sets-of-interesting-decisions)
- ペース配分：複雑な決定が続きすぎると制御不能感、単純な決定がゆっくり続くと退屈 — [Game Developer](https://www.gamedeveloper.com/design/gdc-2012-sid-meier-on-how-to-see-games-as-sets-of-interesting-decisions)
- アイデアの約1/3は面白さが足りず削除される。決定だけでなく魅力的な世界（fantasy）との組み合わせが長期的関係を作る — [Game Developer](https://www.gamedeveloper.com/design/gdc-2012-sid-meier-on-how-to-see-games-as-sets-of-interesting-decisions)
- 講演は1989年の自説を再訪したもので、GDC Vault で無料公開 — [GDC news](https://www.gdconf.com/news/gdc_2012_adds_meier_inafune_le); [Game Developer video](https://gamedeveloper.com/design/video-sid-meier-explores-interesting-decisions-in-gameplay)
- Keith Burgun：ゲームを「曖昧な意思決定の競争（a contest of ambiguous decision-making）」と規範的に定義。良いゲームの決定は「興味深く、難しく、よりよい答えが曖昧」 — [Game Developer: What Makes a Game? (Burgun 2012)](https://www.gamedeveloper.com/design/what-makes-a-game-)
- Burgun（中国語要約経由）：決定とは、行動に十分な情報はあるが最善は確信できない状況。決定の結果は持続的でなければならず、さもないとプレイヤーは全選択肢を試すだけになる — [gamerboom（中国語）](https://gamerboom.com/archives/95674)

### Inferences
- カード設計のチェックリスト化：各カード／各アクションについて、①何を諦めさせるか（コスト・機会費用）、②どんな状況で強く／弱くなるか、③短期と長期どちらに効くか、④取り消し不能か、⑤プレイヤーが効果を予測できるか、⑥使った瞬間に目に見える反応があるか。
- 2人対戦では「状況依存」の最大源は相手の手。同じカードの価値が相手の状況で変わるように設計すると、決定が自然に興味深くなる。
- 「常に1番目を選ぶ」状態＝支配的選択肢（dominant option）。コスト調整かカウンター手段で解消する。

### Gaps
- Brian Upton（『The Aesthetic of Play』の「制約下の自由な動き」等）については今回調査できなかった。
- Meier 講演の動画本文（37:00〜44:37「Making Decisions More Interesting」）は直接視聴・確認していない。

## 4. Greg Costikyan『Uncertainty in Games』と入力／出力ランダム性（Engelstein）

### Takeaway
ゲームが関心を保つには不確実性が必要で、その源は乱数だけでなく、相手の予測不能性・分析的複雑さ・隠匿情報など多様。カードゲームでは「入力ランダム性（決定前の乱数、例：手札のドロー）」を主、「出力ランダム性（決定後の乱数、例：攻撃判定のダイス）」を慎重に使うのが一般的指針だが、反論もある。

### Cited Findings
- 中心命題：ゲームは関心を保つために不確実性を必要とし、不確実性を制する苦闘がゲームの魅力の中心。予測可能性は楽しさを阻害する — [Liz England review](https://lizengland.com/blog/review-uncertainty-in-games-by-greg-costikyan/); [Jesper Juul on the book](https://www.jesperjuul.net/ludologist/2013/05/30/greg-costikyan-uncertainty-in-games/)
- 不確実性の源（書評による列挙）：
  1. 遂行の不確実性（Performative uncertainty）：必要な行動を実行できるか。例：テトリス
  2. 解答者の不確実性（Solver's uncertainty）：パズルを解けるか。作られたパズルより創発的パズル（レミングス）を好む
  3. 相手の予測不能性（Player unpredictability）：相手が何をするか。例：じゃんけん、マルチプレイ
  4. 分析的複雑さ（Analytic complexity）：系が複雑すぎて全体を把握できない。例：チェス
  5. ランダム性（Randomness）：例：ダイス。多数回振るゲームでは戦略と均衡し、技量が結果を決める傾向
  6. 隠匿情報（Hidden information）：例：ポーカーの相手の手札
  7. 知覚の不確実性（Uncertainty of perception）：例：Guitar Hero
  8. 物語的期待（Narrative anticipation）：どう終わるか分からない（終盤の逆転）。モノポリーは勝者が早く確定しがちな対比例
  9. スケジュールの不確実性（Uncertainty of schedule）：例：FarmVille
  10. 開発への期待（Development anticipation）：アップデート等
  — [Liz England review](https://lizengland.com/blog/review-uncertainty-in-games-by-greg-costikyan/)
- Costikyan は、モノポリーの不確実性は主にダイスとカードから来てプレイヤーの決定からではないため、その魅力はゲーム性ではなく「色」（テーマ）にあると論じる — [Search summary of reviews; e.g. Leonardo review](https://leonardo.info/reviews_archive/july2014/costikyan-wong.php)
- 評者の批判：習得後・再プレイ時の不確実性の変化を扱っていない、パズルに関する主張が自己矛盾、不確実性が過剰／過少な場合の章が短い — [Liz England review](https://lizengland.com/blog/review-uncertainty-in-games-by-greg-costikyan/)
- Engelstein の定義：入力ランダム性（input randomness）はプレイヤーの決定の前、出力ランダム性（output randomness）は決定の後に生じる。例：Slay the Spire の手札（入力）、Risk の攻撃ダイス（出力） — [Skeleton Code Machine: Input-Output Randomness Part 2](https://www.skeletoncodemachine.com/p/input-output-randomness-part-2)
- Engelstein の立場（論文による引用）：入力ランダム性は戦略を支え、出力ランダム性は戦略計画を損なう — [arXiv 2107.08437 (CCGにおける入出力ランダム性と満足度)](https://arxiv.org/pdf/2107.08437)
- 反論：Mark Brown は「よく調整された出力ランダム性はゲームを良くし、拙い入力ランダム性はゲームを損なう」と論じる。Skeleton Code Machine は両者を道具箱の道具として扱うべきとする — [Skeleton Code Machine](https://www.skeletoncodemachine.com/p/input-output-randomness-part-2)
- Engelstein は GDC 2018 でランダム性の種類と用途について講演 — [Engelstein 関連検索結果（Skeleton Code Machine 経由）](https://www.skeletoncodemachine.com/p/input-output-randomness-part-2)
- 注：Engelstein 自身の原文（GameTek）は確認できず、上記は二次資料による。

### Inferences
- 2人対戦カードゲームの不確実性ポートフォリオ設計：
  - 主軸は「相手の予測不能性＋隠匿情報」（手札・同時公開・ブラフ）。これは技量で読めるので「運ゲー」感を生まない。
  - ランダム性はドロー（入力）中心にし、決定後の判定ダイス（出力）は最小化、または緩和手段（再ロール、確率の可視化、複数回試行で平均化）を付ける。
  - 「物語的期待」＝終盤まで勝敗が決まらない構造（逆転手段、終盤ほど得点が大きい等）を入れる。
- 不確実性ゼロ（完全情報・決定論・解析可能）は Koster の「解けたゲーム」に直結。少なくとも1種類の不確実性は常に残す。

### Gaps
- Costikyan 原文の正確な分類名・章構成は未確認（書評による列挙のため、表記揺れの可能性あり）。
- Engelstein『GameTek』等の原典記述は未取得。

## 5. Csikszentmihalyi のフロー理論のゲームへの応用：緊張と解放、ペース、クライマックス

### Takeaway
フローは「挑戦と能力の釣り合い」で不安と退屈を避ける状態。ゲームでは難易度調整・ペース配分・緊張の高まり→解放→結末という劇的構造として応用される。ただし「フロー＝難易度バランス」とする解釈は狭すぎるとの批判もある。

### Cited Findings
- Jenova Chen：フローを維持するには挑戦を能力に釣り合わせ、不安と退屈が起きない安全地帯（Flow Zone）に留まる必要がある — [Jenova Chen: Flow in Games mission statement](https://www.jenovachen.com/flowingames/missionstatement.htm)
- Chen（2007, Communications of the ACM）：良く設計されたゲームはプレイヤーを各自のフローゾーンへ運ぶ。テストではプレイヤーをフローから引き剥がす「エントロピー」（バグから進行の問題まで）を除去すべき — [Chen "Flow in Games" (CACM 2007) PDF](https://khoury.northeastern.edu/~lieber/courses/csu670/f08/materials/p31-chen-flow-in-games.pdf)
- flOw は、プレイヤー自身がゲーム内の選択で難易度を変えられる（大きな生物を避けるか食べるか）ことで楽しさが増すかを試すために作られた — [flOw (Wikipedia)](https://www.wikipedia.org/wiki/FlOw)
- 批判：フローを難易度バランスと同一視するのは狭すぎ、難易度曲線のない状況（The Sims 等）でも強い没入が起きる — [Game Developer: Gamification Dynamics: Flow and Art](https://www.gamedeveloper.com/design/gamification-dynamics-flow-and-art)
- MDA：劇的緊張（dramatic tension）は「緊張の高まり（rising tension）、解放（release）、結末（denouement）」を促すダイナミクスから生まれる。モノポリーでは差が開くと劇的緊張が失われる — [MDA paper](https://users.cs.northwestern.edu/~hunicke/MDA.pdf)
- Meier：複雑な決定の連続は制御不能感、単純でゆっくりな決定は退屈を生む（決定のペース配分） — [Game Developer](https://www.gamedeveloper.com/design/gdc-2012-sid-meier-on-how-to-see-games-as-sets-of-interesting-decisions)

### Inferences
- アナログ2人対戦では、難易度を「対戦相手」が自然に供給するため、フロー設計の主眼は①ターンあたりの思考量（分析麻痺を避ける）、②待ち時間（ダウンタイム）の短縮、③1ゲーム内の緊張曲線（序盤は展開・中盤で衝突・終盤で決着の山場）に移る。
- 終盤クライマックスの作り方の例：ゲーム終了トリガーの可視化（残り山札、得点トラック）、終盤ほど強いカード／高得点、最終ラウンドの同時公開。
- 技量差のある相手同士のフロー維持には、ハンデ（初期リソース差）やドラフト等の自己調整手段が考えられる。

### Gaps
- Csikszentmihalyi の原典（『Flow』1990）の9要素などは今回直接確認していない。
- テーブルゲームにおける「ペース配分」「クライマックス」を扱った定量的研究は見つからなかった。

## 6. Richard Garfield の見解と『Characteristics of Games』（Elias, Garfield, Gutschera）

### Takeaway
同書はゲームを「プレイヤー数、ルール、運と技量の度合い、報酬／労力比」など共通特性で分析する枠組みを与え、雪だるま（snowball）と追い上げ（catch-up）、キングメイキング（kingmaking）、運と技量（luck and skill）、隠匿情報、プレイヤーの労力（player effort）などを章として扱う。

### Cited Findings
- 同書はプレイヤー数、ルール、必要な運と技量の度合い、報酬／労力比（reward/effort ratio）などの特性を比較・分析の軸とする。コンピュータゲーム、カード、ボード、スポーツを横断 — [MIT Press Bookstore](https://mitpressbookstore.mit.edu/book/9780262542692); [Penguin Random House](https://penguinrandomhouse.ca/books/655769/characteristics-of-games-by-george-skaff-elias-richard-garfield-and-k-robert-gutschera-foreword-by-eric-zimmerman-diagrams-by-peter-whitley/9780262300445)
- 目次（検索結果より）：「Characteristic: Kingmaking」（p.56、多人数の節）、「Characteristic: Snowball and Catch-Up」（p.106）、「Characteristic: Luck and Skill」（p.150、Randomness の節内）、その後「Hidden Information」、「Player Effort」（p.167） — [MIT Press Bookstore / 目次情報（検索結果要約）](https://mitpressbookstore.mit.edu/book/9780262542692)
- Eric Zimmerman の序文：追い上げ（catch-up）はゲームの根本的現象で「遊びの深いパラドックス」。運と技量の量を測ることは地雷原（チェス、ポーカー、ルーレットをどう数値比較するか） — [Characteristics of Games foreword (Zimmerman PDF)](https://www.ericzimmerman.com/assets/pdfs/Characteristics_of_Games_foreword.pdf)
- 演習問題付きで、ゲームデザイナー視点の分析枠組みを提供 — [Penguin Random House](https://penguinrandomhouse.ca/books/655769/characteristics-of-games-by-george-skaff-elias-richard-garfield-and-k-robert-gutschera-foreword-by-eric-zimmerman-diagrams-by-peter-whitley/9780262300445)
- 著者：Richard Garfield は数学者・Magic: The Gathering の作者 — [MIT Press Bookstore](https://mitpressbookstore.mit.edu/book/9780262542692)

### Inferences
- 2人対戦への適用：
  - キングメイキングは3人以上の問題なので2人対戦では原則発生しない（2人対戦の構造的利点）。代わりに「雪だるま（序盤の優位が拡大し続ける）」が主要リスク。MDA のモノポリー分析と同じ問題で、追い上げ手段（遅れている側の利益、リーダーへの負荷、終盤高得点）か、決着を早めて「負け確定後の消化試合」を短くする設計で対処。
  - 運と技量の比率はターゲット層で決める：運が多い＝初心者も勝てる・短時間向け、技量が多い＝熟練が報われる・リプレイ性。
  - ダウンタイム（相手の手番の待ち時間）は2人対戦では手番が交互なので特に体感が大きい。相手の手番中にも判断（リアクション、割り込み）を入れる工夫が考えられる。
- 「報酬／労力比」：ルール・思考負荷（労力）に見合う体験（報酬）があるかを常に問う。

### Gaps
- 書籍本文にアクセスできず、各章の具体的定義・推奨（例：ダウンタイム、ゲーム長、ルール複雑度の扱い）は確認できなかった。「downtime」という語の章は目次に見当たらない。
- Garfield の運と技量に関する他の講演・記事（例：GDC講演）は今回未取得。

## 7. Reiner Knizia の設計原則（得点の緊張、競り、「苦渋の決断」）

### Takeaway
Knizia の代表的手法は「得点ルールがプレイを駆動する」こと。Tigris & Euphrates / Ingenious の「最も弱い色の得点で勝敗を決める」ルールは特化を抑え、常にバランスを取らせる緊張を生む。

### Cited Findings
- Tigris & Euphrates：最も弱いカテゴリの得点が最も高いプレイヤーが勝つ。特化を制限するためのルール。Knizia は後にこのメカニズムを Ingenious の基礎にした — [Wikipedia: Tigris and Euphrates](https://en.wikipedia.org/wiki/Tigris_and_Euphrates)
- Ingenious：配置不能で終了し、最も低い得点コマの位置が最終得点。「最低得点が最も高い者」が勝つ — [Meeple Mountain: Ingenious review](https://www.meeplemountain.com/reviews/ingenious-review-a-knizia-abstract-at-its-finest)
- Knizia は「得点がゲームプレイを駆動する（scoring drives gameplay）」と述べ、T&E の最弱色重視が目標を劇的に変えた点を強調（二次的な講演要約） — [Justin Gary: Reiner Knizia systems](https://justingarydesign.substack.com/p/reiner-knizia-systems-for-publishing?open=false)
- T&E では同色リーダーの王国が繋がると衝突が起き、拡大した国は補強しない限り弱くなる — [Miniature Market review](https://www.miniaturemarket.com/reviewcorner/tigris-and-euphrates-review); [20th Century Games](https://20thcenturygames.substack.com/p/tigris-and-euphrates)
- 注：「lowest-score-wins」という一般的表現は不正確で、正しくは「最低得点の最大化（highest-lowest）」 — [Wikipedia](https://en.wikipedia.org/wiki/Tigris_and_Euphrates)

### Inferences
- 得点システムを「緊張の発生装置」として使う：
  - 最弱項目スコア（min スコア）→全方位にリソースを割かせ、相手は自分の弱点を突く（2人対戦で強い相互作用を生む）。
  - 1つのカードに複数の用途を持たせ（例：コストとして捨てるか効果として使うか）、どちらを選んでも何かを失う「苦渋の決断」を作る。
  - 競り（auction）は価値評価をプレイヤーに委ねる仕組みで、カードの価値付けバランスの問題を「プレイヤー間の読み合い」に変換する。
- これらはカード1枚の強さではなく「得点・終了条件の構造」で面白さを作る発想で、2人対戦では特に相手の弱点を攻める／守るダイナミクスにつながる。

### Gaps
- Knizia 本人のインタビュー原文（苦渋の決断 / agonizing decisions、競りゲーム Ra / Modern Art / Medici の設計意図）は今回取得できなかった。「agonizing decisions」という表現の出典も未確認。

## 8. Engelstein & Shalev『Building Blocks of Tabletop Game Design』：分類の要点

### Takeaway
同書はテーブルゲームのメカニズム事典で、章立て自体が設計の分解軸（構造→手番順→アクション→解決→終了と勝利→…→カードメカニズム）として使える。

### Cited Findings
- 第2版（2022, Routledge）の章構成：1. Game Structure、2. Turn Order and Structure、3. Actions、4. Resolution、5. Game End and Victory、…13. Card Mechanisms（全13章） — [Routledge: 2nd Edition](https://www.routledge.com/Building-Blocks-of-Tabletop-Game-Design-An-Encyclopedia-of-Mechanisms/Engelstein-Shalev/p/book/9781032015811)
- 第2版は第1版より多くのメカニズムを収録し、既存項目を拡張・更新 — [Routledge](https://www.routledge.com/Building-Blocks-of-Tabletop-Game-Design-An-Encyclopedia-of-Mechanisms/Engelstein-Shalev/p/book/9781032015811)
- 書評あり — [Meeple Mountain book review](https://www.meeplemountain.com/reviews/building-blocks-of-tabletop-game-design-a-book-review/)

### Inferences
- 設計チェックリストとして章順に決める：①ゲーム構造（対戦／協力、ラウンド制）→②手番順（交互、同時、入札で手番決定）→③アクション（アクションポイント、ワーカー配置、カードプレイ）→④解決（比較、ダイス、ブラフ）→⑤終了と勝利（得点、条件達成、サドンデス）→カード固有メカニズム（ドラフト、デッキ構築、手札管理）。
- 2人対戦カードゲームでは特に「手番順」と「終了条件」が緊張に直結（同時公開は読み合い、終了トリガーの可視化はクライマックス）。

### Gaps
- 各章内の個別メカニズム項目（例：action selection、turn order の下位分類）の具体的内容は取得できなかった。

## 9. プレイの心理学：自己決定理論（SDT）、Lenticular Design、損失回避・ニアミス・変動報酬

### Takeaway
SDT（自律性・有能感・関係性）はゲームの楽しさと継続を独立に予測することが実証されている。Rosewater の lenticular design は「初心者には単純に、熟練者には深く見える」カード設計原則で、Koster の学習理論と組み合わせて段階的な深さを作る手段となる。

### Cited Findings
- Ryan, Rigby, Przybylski（2006, Motivation and Emotion）：ゲーム内の自律性（autonomy）と有能感（competence）の知覚は、楽しさ・選好・プレイ前後の幸福感の変化と関連。SDT の3欲求（自律性・有能感・関係性 relatedness）はそれぞれ独立に楽しさと将来のプレイを予測 — [Rochester (Ryan, Rigby, Przybylski 2006 PDF)](https://www.rochester.edu/warner/lida/wp-content/uploads/2022/11/02bfe513dd59366750000000.pdf); [selfdeterminationtheory.org PENS](https://selfdeterminationtheory.org/player-experience-of-needs-satisfaction-pens/)
- 測定尺度 PENS（Player Experience of Need Satisfaction）。後継の BANGS（Basic Needs in Games Scale）は欲求の「充足」だけでなく「阻害（frustration）」も測る — [selfdeterminationtheory.org](https://selfdeterminationtheory.org/player-experience-of-needs-satisfaction-pens/); [BANGS (Ewha)](https://pure.ewha.ac.kr/en/publications/the-basic-needs-in-games-scale-bangs-a-new-tool-for-investigating/)
- Adinolf & Türkay（2019 DiGRA）：コレクタブルカードゲーム4作の1,017人のプレイヤー調査で、自律性・有能感の充足はゲーム間で有意差があったが、コミュニティ感に差はなかった — [DiGRA paper](https://dl.digra.org/index.php/dl/article/download/1093/1093)
- Lenticular design（Mark Rosewater）：初心者には単純に見え、熟練者には戦略的深さが見えるカード。名前は傾けると絵が変わるレンチキュラー印刷から。複雑さには「理解の複雑さ（comprehension）」「盤面の複雑さ（board）」「戦略の複雑さ（strategic）」の3種があり、初心者は理解→盤面の順に気づき、戦略的複雑さは最後まで隠れる。lenticular なカードは前2者を低く保ち、戦略的深さを初心者が見ない場所に置く — [Making Magic: Lenticular Design](https://magic.wizards.com/en/news/making-magic/lenticular-design-2014-12-15)
- Lenticular の要件：初心者が「わかった」と感じる明確な表面的価値、初心者にも意味が通るが含意は気づかれない戦略的テキスト、初心者に「とりあえず使う」ことを促しゲームを前進させつつ熟練者には意味ある選択を与える — [Making Magic: Lenticular Design](https://magic.wizards.com/en/news/making-magic/lenticular-design-2014-12-15)
- 例：Black Cat（死亡時に相手が手札を捨てる1/1。熟練者は死亡誘発を前提に運用を変える）、Festering Goblin（戦闘ダメージ＋死亡時-1/-1の組み合わせ）。悪い例：Aven Cloudchaser は初心者が条件待ちで抱え込み不満を生む — [Making Magic: Lenticular Design](https://magic.wizards.com/en/news/making-magic/lenticular-design-2014-12-15)

### Inferences
- SDT のカード／ボードゲーム設計への翻訳：
  - 自律性：複数の勝ち筋、デッキ構築・ドラフト、プレイスタイル表現（Meier の personal expression と同じ）。
  - 有能感：勝敗以外の「上達の手応え」（うまいプレイが目に見える結果を生む、明確なフィードバック）。運要素が強すぎると有能感を損なう。
  - 関係性：2人対戦では対戦相手との読み合い・会話・リマッチ欲求。
- Lenticular design は「低い参入障壁」と「高いスキル天井」を両立させる具体的手法。カードテキストは短く具体的に、深さはカード同士の相互作用・タイミングから生まれるように設計する。
- 損失回避（loss aversion）、ニアミス（near miss）、変動報酬（variable rewards）については今回信頼できる一次資料を取得できていない。一般的な行動経済学・心理学の知見としては、①損失を利得より重く感じるため「失う選択」は強い緊張を生む（苦渋の決断と関連）、②ニアミスは再挑戦意欲を高める、③不規則な報酬は期待を持続させる、とされるが、出典確認が必要（Gaps 参照）。射幸性の強い用途（ギャンブル的仕組み）には倫理的配慮が必要。

### Gaps
- 損失回避（Kahneman & Tversky のプロスペクト理論）、ニアミス効果、変動比率強化（variable ratio reinforcement）のゲームへの適用についての出典は今回未取得。Engelstein『Achievement Relocked』（ゲームにおける行動経済学）がこの領域の有力な資料と思われるが未確認。
- Daniel Cook（Lost Garden）のスキル原子（skill atoms）・ループ理論は今回調査できなかった。
