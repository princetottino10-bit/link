# デジタル／モバイル対戦カード・戦略ゲームの面白さと設計原則（スマホ・短時間オンライン1v1向け）

対象ユースケース: Compile × Smash Up 風の2人用オンライン対戦カードゲームを、スマホで遊べるWebプロトタイプとして作る。
調査日: 2026-10-09。一次情報（GDC講演の要約、開発者インタビュー）を優先したが、GDC Vault本体は会員限定のため、多くは二次的な講演レポート経由である点に注意。

---

## Q1. 試合を短く・緊張感あるものにする方法（ターンタイマー、同時ターン、固定長）

### Takeaway
Marvel Snap は「6ターン固定 × 同時プレイ（simultaneous turns）× 1ラウンド約35〜40秒」で試合の最大長を約3〜4分に固定し、相手待ちのダウンタイムをほぼ消した。Clash Royale も「3分＋延長」の固定長で「5分あれば確実に1戦できる」という安心感を作っている。短さの本質は「平均の短さ」より「上限が保証されていること」。

### Cited Findings
- Brode は GDC 講演「Designing MARVEL SNAP」(2023) で、Clash Royale を引き合いに「5分あれば100%確実に1戦できる（If you have five minutes you are 100% sure you can get a game of Clash Royale in）」ことを重視したと語った。Snap も同様の目標で設計 — [mobilegamer.biz](https://mobilegamer.biz/second-dinners-ben-brode-reveals-marvel-snaps-recipe-for-success-literally/)
- GDC セッション概要: 「3分のバトル、ロケーション、バックギャモンのダブリングキューブの借用」で新方向に進んだ — [GDC Vault: Designing MARVEL SNAP](https://gdcvault.com/play/1029024/Designing-MARVEL-SNAP)
- Snap は6ラウンドで「試合の最大長が固定（約3〜4分）」。Hearthstone は可変長で平均9ターン程度、ターン制限75秒。昼休み・バス移動・CM中に収まる長さ — [Game Developer: Designers don't sleep on Marvel Snap's simultaneous turns](https://www.gamedeveloper.com/game-platforms/designers-don-t-sleep-on-marvel-snap-s-simultaneous-turns)
- 交互ターン制では「片方が急ぎ、片方が遅いと、どちらかが相手のペースに苛立つ」。同時ターンはこの待ち時間をほぼ消す。各ラウンドは約35〜40秒が上限 — [Game Developer](https://www.gamedeveloper.com/game-platforms/designers-don-t-sleep-on-marvel-snap-s-simultaneous-turns)
- Snap のターンタイマーは「右下の紫の End Turn ボタン自体がタイマーを兼ねる」UI統合型 — [Game Developer](https://www.gamedeveloper.com/game-platforms/designers-don-t-sleep-on-marvel-snap-s-simultaneous-turns)
- 長すぎるカード誘発ループは自動で「早送り（fast forward）」して終端まで飛ばす — [Twinfinite: fast-forwarding in Marvel Snap](https://twinfinite.net/2023/02/what-is-fast-forwarding-in-marvel-snap-explained/)（検索結果スニペットより）
- Clash Royale: 通常3分、ラスト1分はエリクサー生成2倍、同点なら延長（先にタワーを壊した方が勝ち）、それでも決着しなければ最も体力の低いタワーを持つ側が負けるタイブレーク — [Wikipedia: Clash Royale](https://en.wikipedia.org/wiki/Clash_Royale)
- 2016年の分析: 最初の2分は2秒ごとに1エリクサー（上限10）、その後倍速になり「戦術的な読み合いから総力戦へ」と試合のテンポが段階的に上がる。アプリ起動→マッチング→開戦が数秒で済むことも短時間性の一部 — [Deconstructor of Fun / Game Developer](https://www.gamedeveloper.com/design/clash-royale---deconstructing-supercell-s-next-billion-dollar-game)
- Supercell は2019年に延長を短縮し最後の1分をエリクサー3倍に変更、「試合長とタイブレークの組み合わせで、最後の2分がより速く技術的になる」と説明 — [Supercell November Update](https://supercell.com/en/games/clashroyale/blog/release-notes/november-update)（※古い告知。現行ルールは要確認）
- デュエル・マスターズ プレイス（デュエプレ）は TCG 版ルールを踏襲しつつ「ゲームテンポの向上や操作の省略」を目的にルール変更。1試合約7分を目指したとの記述（wikiの推測含む）。サーチ（探索）廃止、行動スキップ時の警告、何もできなくなったら自動ターンエンド、対人戦の持ち時間制限などを実装 — [デュエマwiki: デュエル・マスターズ プレイス](https://www.dmwiki.net/%E3%83%87%E3%83%A5%E3%82%A8%E3%83%AB%E3%83%BB%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC%E3%82%BA+%E3%83%97%E3%83%AC%E3%82%A4%E3%82%B9)
- デュエプレ記者発表会（2019）のデモバトルは約4分で決着 — [gamer.ne.jp 記者発表会レポート](https://www.gamer.ne.jp/news/201909260083/)
- Gwent はマナが無く「カード（手札）そのものが唯一の有限資源」。3ラウンド制で2本先取、両者パスでラウンド終了 — [PC Gamer: The making of Gwent](https://www.pcgamer.com/uk/the-making-of-gwent) / [Game Informer review](https://www.gameinformer.com/review/gwent-the-witcher-card-game/from-diversion-to-main-attraction)

### Inferences
- Compile × Smash Up 系プロトタイプでは「最大ターン数 or 最大ラウンド数を固定」し、試合の上限時間を UI で明示する（例: 「残り◯ターン」表示）のが有効。Smash Up は基地（base）の破壊点で終了、Compile はプロトコル3つのコンパイルで終了と可変長なので、デジタル版では上限ターン＋タイブレーク規則（Clash Royale型）を足すと安心感が出る。
- 同時ターン（両者が裏向きで出し、一斉公開）は、オンラインで最も嫌われる「相手待ち」を消す最強の手段。完全同時化が難しいなら「同時に計画→順番に解決」の Snap 型（優先権 priority で公開順を決める）が参考になる。
- タイマーはボタンと一体化させる、自動ターンエンド・誘発ループの早送り・不要確認の省略など、デュエプレ型の「操作省略」をデジタル化時に積極的に入れる。
- 終盤ほど資源が増えて展開が激化する（Clash Royale の倍速エリクサー、Snap の6ターン目）という「時間とともに上がる緊張曲線」を組み込むと短い試合でもクライマックスが作れる。

### Gaps
- Snap の切断時処理・公開順（リード側が先に公開）の公式な設計意図は見つからなかった。
- Clash Royale の縦持ち・片手操作についての Supercell 公式の設計意図は見つからなかった。

---

## Q2. 運（variance）の管理: 負けを受け入れやすく、勝ちを「実力」と感じさせる方法

### Takeaway
Snap は「スナップ（倍賭け）とリトリート（撤退）」で、運の悪い試合を“小さな負け”に切り詰め、良い試合を“大きな勝ち”に膨らませる構造を作った。結果として「勝率」より「どれだけ賭けたか」の判断が実力の主軸になる。Brode・Hearthstone 陣営とも「運は捨てるな、ただし入力型・管理可能なランダムに」という立場。

### Cited Findings
- スナップの起源はバックギャモンのダブリングキューブ。発案は Hamilton Chu で「カードゲームを作ると決まる前から」あったアイデア — [TheGamer: Brode D23 interview](https://www.thegamer.com/marvel-snap-interview-ben-brode-d23-expo/) / [Kotaku](https://kotaku.com/marvel-snap-ben-brode-round-one-1-stats-cubes-best-tips-1849978932)（検索結果スニペットより）
- 賭け金: 誰もスナップしなければ2キューブ、片方がスナップで4、両者スナップで8（最終ターンでさらに倍化）。相手のスナップを拒否してリトリートすれば、その時点の賭け金だけ失って抜けられる — [esports.gg guide](https://esports.gg/guides/gaming/marvel-snap-learn-how-to-snap-and-maximize-your-cube-gains-with-this-guide)
- Brode:「ブラフを可能にする非常にシンプルなメカニクスがあると気づいた時点で、残りのルールをずっとシンプルにできると分かった」 — [TheGamer](https://www.thegamer.com/marvel-snap-interview-ben-brode-d23-expo/)（検索結果スニペットより）
- ダブリングキューブの変種を9種類試作し、最もシンプルなものを採用 — [mobilegamer.biz](https://mobilegamer.biz/second-dinners-ben-brode-reveals-marvel-snaps-recipe-for-success-literally/)
- Brode:「勝率がマイナスでも、勝つときに8キューブ得て負けるときに1キューブしか失わないプレイヤーはランクを駆け上がる」 — [Yahoo/Kotaku: Players who snap at the start are smart](https://malaysia.news.yahoo.com/marvel-snap-creator-says-players-160600890.html)
- 撤退時の表示を「You Lose!」から「Escaped!」に変更し、撤退を“負け”ではなく“逃げ切り”に感じさせた（Eric Dodds の「Little Victories」の考え方に影響） — [mobilegamer.biz](https://mobilegamer.biz/second-dinners-ben-brode-reveals-marvel-snaps-recipe-for-success-literally/)
- Brode:「運と実力は一本の軸の両端ではない」。「高運・高実力」のゲームは毎回違う面白い判断が多く特に楽しい。入力型ランダム（input randomness: ランダムな事象を見てから判断する）と出力型ランダム（output randomness: 判断の後に結果が決まる）を区別し、「どちらも受け入れよ（Embrace randomness – input or output）」。ロケーションと一部カードが両方の型のランダムを提供 — [mobilegamer.biz](https://mobilegamer.biz/second-dinners-ben-brode-reveals-marvel-snaps-recipe-for-success-literally/)
- Hearthstone の Eric Dodds:「RNG は素晴らしいストーリーを生む。RNG がまったくないゲームは望まない」。Jason Chayes:「実力で管理できるランダムであるべき」。Discover（3枚から1枚選ぶ）は“ランダムだが選択できる”妥協点 — [PCGamesN](https://pcgamesn.com/hearthstone/hearthstone-dev-communication-balance-design-rng)（検索結果スニペットより）
- Brode はロケーション批判に対し「ロケーションは実はかなり実力を試す」「“これがランダムでなければ勝てた”と感じがちだが、両者が同じ量のランダムを受けている」と反論 — [Twinfinite: Ben Brode defends Marvel Snap's most hated locations](https://twinfinite.net/2022/11/ben-brode-defends-marvel-snaps-most-hated-locations/)（検索結果スニペットより）
- Gwent: 先にパスすると現ラウンドを捨てる代わりにカード・アドバンテージを得られる。第1ラウンドを高コストで勝つと第3ラウンドで弾切れ、逆に早く降りすぎると相手に温存札を吐き出させられない — 運よりリソース配分の判断が勝敗を決める構造 — [Game Informer](https://www.gameinformer.com/review/gwent-the-witcher-card-game/from-diversion-to-main-attraction)（検索結果スニペットより）
- Gwent デザイナー:「Gwent は主にブラフとラウンド間のカード管理。能力はその上に乗っている」 — [PC Gamer: The making of Gwent](https://www.pcgamer.com/uk/the-making-of-gwent)
- Slay the Spire はシングルプレイなので「強すぎる戦略が相手を不快にする」問題がなく、まれな壊れコンボを許容できる。一方で「すべてのカードに居場所を」「環境を歪めすぎるものは避ける」が方針 — [Game Developer: Road to the IGF](https://www.gamedeveloper.com/disciplines/road-to-the-igf-mega-crit-games-i-slay-the-spire-i-) / [Critical Play 要約](https://mechanicsofmagic.com/2022/05/22/critical-play-is-this-game-balanced-10/)

### Inferences
- 対戦型で運要素（Smash Up の基地ランダム、山札順）を残すなら、「降参を部分損失にする」仕組み（Snap型リトリート）か「複数ラウンド制で1ラウンドの不運を吸収」（Gwent型ベスト・オブ・3）を入れると負けの受容性が上がる。カジュアルなフレンド戦なら「賭け点（ポイント倍化）＋途中撤退」は勝敗の物語も作る。
- ランダムは「公開されてから判断できる」入力型に寄せる（例: 次の基地／ロケーションを1ターン前に公開、Snap のロケーション段階公開、Discover型の3択）。結果が判断後に決まる出力型は演出の山場としてのみ使う。
- 負け演出の言葉選び（「Escaped!」）は実装コストゼロで効く。

### Gaps
- Snap の「ロケーションを1ターンに1つずつ公開する」設計意図の一次ソースは未確認。
- Snap における実際のリトリート率・試合長などの定量データは見つからなかった。

---

## Q3. ハイライト瞬間と小画面での可読性（UI・アニメーション・意図表示）

### Takeaway
小画面では「テキスト量を絞る」「同時公開で一気に情報を見せる」「判断に必要な情報（敵の意図、優先権）を常時表示する」が鍵。Hearthstone/Snap 系は「画面上8語ルール」を意識し、Slay the Spire は敵の次行動（intent）を明示して“運”を“計画”に変えた。

### Cited Findings
- Brode は「画面に8語以上置くとプレイヤーは読まない」というルールを引用。Snap は平均11語、Hearthstone は9語で、完全には守れていないと自ら認めた — [mobilegamer.biz](https://mobilegamer.biz/second-dinners-ben-brode-reveals-marvel-snaps-recipe-for-success-literally/)
- Snap は「弱いストーリーより、ストーリー無し」を選び、タイトルも最も直感的なものを選んだ — [mobilegamer.biz](https://mobilegamer.biz/second-dinners-ben-brode-reveals-marvel-snaps-recipe-for-success-literally/)
- 同時公開により、ブラフ（「デジタルのフェイント」）や、ロケーションの隠し効果が公開される驚きが生まれる。Hearthstone のような攻撃対象の矢印カーソルを使わないので、公開が事前に漏れない — [Game Developer](https://www.gamedeveloper.com/game-platforms/designers-don-t-sleep-on-marvel-snap-s-simultaneous-turns)
- Snap の公開順: 多くのロケーションで勝っている側が優先権を持ち先に公開。同点なら点差、それも同じならランダム。優先権はプレイヤー名の光る枠で常時表示 — [PCGamesN: who reveals first](https://www.pcgamesn.com/marvel-snap/who-reveals-first) / [Untapped.gg: How priority works](https://blog.snap.untapped.gg/marvel-snap-wiki-how-priority-works)
- Brode: 隠しゾーン間のカード移動では具体的情報を見せない方針。VFXの負荷とプレイヤーの認知負荷を下げるため — [marvelsnapzone dev tracker](https://marvelsnapzone.com/?p=57820)（検索結果スニペットより）
- Hearthstone（Eric Dodds, GDC 2014）の10原則: Iterate Fast / Share the Vision / Simplify / Keep it Deep（複雑さは削り深さは残す）/ Immediate Fun / Embrace the Medium（紙のルールをそのまま持ち込まない）/ Don't Change Too Much / Support Player Stories / Emotional Design Matters / Little Victories（試合の流れを変えたと感じる瞬間を与える） — [80.lv: Hearthstone 10 rules of great design](https://80.lv/articles/hearthstone-10-rules-of-great-design) / [Game Developer: 10 pieces of Hearthstone design wisdom](https://gamedeveloper.com/design/video-10-pieces-of-i-hearthstone-i-design-wisdom)
- Dodds:「プレイヤーに説明しなくていいものは何でも天の恵み（anything you don't have to explain to your player is a godsend）」 — 同上（検索結果スニペットより）
- Star Realms デザイナー Darwin Kastle: デジタル化でセットアップとデータ管理（点数計算など）が楽になる。爆発・レーザー音・星空背景・音楽で SF テーマが映える — [Pocket Gamer interview](https://www.pocketgamer.com/star-realms/white-wizard-games-talks-star-realms-an-interview-from-beyond-the-galaxy/)
- デュエプレは戦況に応じて BGM がシームレスに変化するインタラクティブミュージックを採用 — [gamebiz](https://gamebiz.jp/news/249484)（検索結果スニペットより）
- Balatro: レビューでは「カードを出す行為自体が物理的快感になるほどカリッとした効果音」と評され、音とフィードバックが中毒性の一因とされる（開発者発言ではなくレビュー） — [GameGeeker review](https://gamegeeker.com/games/balatro/review?market=US)
- Clash Royale は観戦時に盤面と両者の手札が見えるが心の中は見えない、という構造で観戦も面白い — [Game Developer](https://www.gamedeveloper.com/design/clash-royale---deconstructing-supercell-s-next-billion-dollar-game)

### Inferences
- カードテキストは1枚あたり極力短く（目安: 画面上8〜11語／日本語なら20〜30字程度）、キーワード化してアイコン＋長押しで詳細、が小画面の定石。Compile のように効果が上中下3段あるカードは、スマホでは「今発動しうる段だけハイライト」する等の工夫が必要。
- 一斉公開（reveal）→順番に解決するアニメーションは、それ自体がハイライト演出になる。公開順・優先権を常に可視化しておくと「なぜ負けたか」が理解でき、納得感に繋がる。
- Slay the Spire 型の「意図表示（intent）」を対戦に転用するなら、「場の効果が次ターン何をするか」「基地があと何点で得点されるか」などシステム側の次の動きを常時表示する。
- Smash Up の基地得点（破壊点到達）は、得点アニメーションと順位表示をまとめて行う“山場”として演出投資する価値が高い。

### Gaps
- Slay the Spire の intent（敵の行動予告）の設計意図を開発者が語った一次ソースは今回見つからなかった（GDC 2019 講演は主にメトリクス主導のバランス調整が主題）。
- Balatro の得点演出（chips × mult の積み上げ表示）について LocalThunk の発言は見つからなかった。
- Inscryption、Shadowverse の UI 設計についての情報は今回収集できず。

---

## Q4. オンボーディング／チュートリアルと複雑さの導入

### Takeaway
成功例は共通して「ルールは極小、深さはカードとロケーションの組み合わせで出す」「最初の5分で面白さを見せる」。Snap はスナップという単純でブラフ可能な核があるから他を削れた。Gwent は「説明が2回必要なカードは複雑すぎる」を基準にした。

### Cited Findings
- Brode の目標:「最小限の複雑さで超深いゲーム、誰でも試せるもの」 — [TheGamer](https://www.thegamer.com/marvel-snap-interview-ben-brode-d23-expo/)（検索結果スニペットより）
- Snap は「すべてはカードとロケーションの特殊能力の相互作用が駆動する」 — [Guardian (PressReader 転載): 'I craved a bite-size experience'](https://www.pressreader.com/usa/the-guardian-usa/20221112/282024741243323)（検索結果スニペットより、本文は取得不可）
- Snap のロケーション要素は Smash Up の「能力を持つ基地」から着想。他の影響元: WoW TCG、Battle Spirits、バックギャモン、Clash Royale、Card Monsters: 3 Minute Duels、TES Legends、PvZ Heroes、LotR: The Confrontation、Game of Thrones — [mobilegamer.biz](https://mobilegamer.biz/second-dinners-ben-brode-reveals-marvel-snaps-recipe-for-success-literally/)
- Hearthstone 原則「Immediate Fun」: 最初から仕組みでワクワクさせる、テキストは短く文脈で伝える。ただし最初の5分で退屈させるほど削りすぎない。「Keep it Deep」: 複雑さは削るが深さは削らない — [80.lv](https://80.lv/articles/hearthstone-10-rules-of-great-design)
- Gwent:「カードを2回説明しなければならないなら、たぶん複雑すぎる」 — [PC Gamer: The making of Gwent](https://www.pcgamer.com/uk/the-making-of-gwent)（検索結果スニペットより）
- Slay the Spire: 何千ものカード案を出し、最もインパクトのあるものに絞って徹底的にプレイテスト。マップの分岐ルート選択は「複雑さをあまり増やさずに深さを足す」。負けるとランがリセットされるが、すぐ新戦略を試せることで頻繁な失敗でも継続意欲を保った — [Game Developer: Road to the IGF](https://www.gamedeveloper.com/disciplines/road-to-the-igf-mega-crit-games-i-slay-the-spire-i-)
- Hanamikoji は「教えやすく理解しやすいが戦略的深みが大きい」選択システム（I cut, you choose 系）として評価 — [Derailments of Thought](https://derailmentsofthought.com/2017/03/02/hanamikoji-review-first-impressions/) / [Opinionated Gamers](https://opinionatedgamers.com/2017/02/27/hanamikoji-re-review-by-chris-wray/)

### Inferences
- プロトタイプでは「最初の1戦はデッキ（またはファクション）を固定、基地/ロケーションも少数の分かりやすいものだけ」に絞る段階的開放が有効。Smash Up の2ファクション合体（シャッフル）は選択自体が楽しいので、オンボーディングでは「おすすめペア」を提示する。
- 中核の“1つの単純で面白い判断”（Snap なら賭け、Gwent ならパス、Hanamikoji なら分配）を決め、それ以外のルールを削る方針が成功例に共通。
- カード効果の文章テスト: 「1回の説明で通じるか」「画面上の語数」をチェック項目にする。

### Gaps
- Snap の具体的なチュートリアル構成（最初の数戦の固定デッキ・ボット戦など）を開発者が語った資料は今回取得できなかった。
- 日本市場（シャドウバース、デュエプレ）のチュートリアル設計についての 4Gamer/ファミ通 インタビューは見つからなかった。

---

## Q5. オンライン対戦の考慮事項（非同期 vs リアルタイム、切断、隠匿情報、タイマー、ルームコード）

### Takeaway
短時間1v1はリアルタイム＋ターンタイマー（または同時ターン）が主流。一方ボードゲーム移植（Star Realms 等）は非同期対戦が重宝され、「リアルタイムで始めて、片方が離れたら自動的に非同期に移行」できるのが理想という声がある。隠匿情報は同時公開でブラフ資源に変えられる。

### Cited Findings
- Star Realms は最初から紙とデジタル両方で成立するよう設計。非同期モードでフレンド対戦・ランダムマッチが可能で「人間相手が最も面白い」と評価 — [Pocket Gamer interview](https://www.pocketgamer.com/star-realms/white-wizard-games-talks-star-realms-an-interview-from-beyond-the-galaxy/) / [Pocket Gamer review](https://www.pocketgamer.com/star-realms/review/)
- Star Realms 公式サイト上の要望記事: プッシュ通知がロビーやメインメニューに飛ばすだけのアプリは不満。どの試合もリアルタイムで遊べ、片方が離れた瞬間に非同期へ移行するのが望ましい。チャット統合と「次に自分の番の試合へジャンプ」機能を推奨 — [starrealms.com](https://www.starrealms.com/?p=708)（検索結果要約より、著者不明）
- Star Realms のソロキャンペーンは「意味の薄いフレーバーテキスト＋普通の対戦」と評価が低かった — [Pocket Gamer review](https://www.pocketgamer.com/star-realms/review/)（検索結果スニペットより）
- Hanamikoji は Board Game Arena で公式ライセンス版が提供され「ほとんどのデバイスで動作」。ファン製 HTML5 版はスマホ入力、パス＆プレイ（同一端末）、3段階AIに対応 — [itch.io: Hanamikoji Digital](https://jonathanneels.itch.io/hanamikoji) / [BGA forum](https://forum.boardgamearena.com/viewtopic.php?p=160899)
- 同時ターンでは「各プレイヤーが持つ情報は前ラウンドに出されたカードだけ」となり、相手の“何を”だけでなく“どこに”出すかを読む必要がある — [Game Developer](https://www.gamedeveloper.com/game-platforms/designers-don-t-sleep-on-marvel-snap-s-simultaneous-turns)
- Hearthstone 原則「Embrace the Medium」: 紙のカードゲームのルールがすべてデジタルで機能するわけではない（例: プレイヤー同士が即座に話せない） — [80.lv](https://80.lv/articles/hearthstone-10-rules-of-great-design)
- Legends of Runeterra: 攻撃トークン（attack token）がラウンドごとに交互に移り、攻撃側/防御側が入れ替わる。攻撃宣言後に防御側がブロッカーを並べる。呪文スタック中は攻撃宣言不可 — [Wikipedia: Legends of Runeterra](https://en.wikipedia.org/wiki/Legends_of_Runeterra) / [LoL Wiki: Attack](https://leagueoflegends.fandom.com/wiki/Vocabs_(Legends_of_Runeterra)/Attack)（コミュニティ資料）
- デュエプレは対人戦に制限時間、VER.2.2.3以降 CPU 戦にも制限時間を導入 — [デュエマwiki](https://www.dmwiki.net/%E3%83%87%E3%83%A5%E3%82%A8%E3%83%AB%E3%83%BB%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC%E3%82%BA+%E3%83%97%E3%83%AC%E3%82%A4%E3%82%B9)

### Inferences
- Webプロトタイプの推奨構成: ①ルームコード（4〜6文字）でフレンド対戦 ②サーバー権威（server-authoritative）で手札・山札など隠匿情報は相手クライアントに送らない ③ターンタイマー（ボタン一体型）＋時間切れ時は自動パス／自動ターンエンド ④切断時は猶予時間（例: 60秒）後にAI代行 or 非同期モード移行 ⑤再接続時は状態を完全再送して復帰。
- Compile は相手のターン中にも割り込み（コンパイル・再コンパイルなど）が少なく交互ターンでテンポが速いが、Smash Up の基地得点時の「誰が先に Before/After 能力を使うか」のような応答ウィンドウは、オンラインでは待ちを生む。LoR の「パスで優先権が移る」方式、または「応答可能なカードがない時は自動スキップ」（デュエプレ型）で待ちを減らす。
- 同時ターン方式にすると、隠匿情報の管理も「確定まで相手に送らない→一斉公開」で単純化できる（実装面の利点、推論）。

### Gaps
- Marvel Snap / Hearthstone の切断・再接続処理の公式仕様は見つからなかった。
- LoR の攻撃トークン／パス制の設計意図を Riot 開発者が語った一次ソースは今回見つからなかった（Wikipedia とファンwikiのみ）。

---

## Q6. プレイヤーの批判（課金以外のゲームプレイ面）

### Takeaway
Snap への主な批判は「ロケーションのランダム性で、カードを出す前に勝負が決まることがある」「同時プレイだとカウンタープレイが難しい」「ハードコントロール（相手の戦略を封じるカード）がストレス」「慣れると単調」。可変要素が多すぎると競技性と納得感を損なう。

### Cited Findings
- Steam ユーザー: ロケーションが相手に大型ミニオンを与えたり自分のデッキをメタったりして5連敗。「同時にカードを出すのは最初はクールだったが、多くのカウンタープレイを事実上不可能にする。ロケーションの重いRNGも」 — [Steam discussions](https://steamcommunity.com/app/1997040/discussions/0/3551679689864636320)（検索結果要約より）
- 「ロケーションのランダム性は楽しさのためだが、競技シーンをほぼ不可能にする。デッキがロケーションのせいで機能しない確率が高すぎる」 — [Steam discussions](https://steamcommunity.com/app/1997040/discussions/0/3463857594045825747)（検索結果要約より）
- 「ゲームコンセプト上ハードコントロールは成立すべきでない」（Leader、Killmonger 等）。「プレイ不能なロケーション、RNG依存、コンテンツ不足」 — [Steam discussions](https://steamcommunity.com/app/1997040/discussions/0/3835423585502853976)（検索結果要約より）
- 「しばらくすると古く単調になる。ロケーションRNGがあっても似通っている」 — [Steam discussions](https://steamcommunity.com/app/1997040/discussions/0/604141990686319273)（検索結果要約より）
- 2025年10月の開発者Q&A:「どれだけのランダムが多すぎるか」は定量化が難しく、どのように・いつ・どの種類のランダムを適用するかを慎重に検討している — [Marvel Snap Zone Developer Tracker](https://marvelsnapzone.com/answers/?q=Warlock)（検索結果要約より）
- Hearthstone についても長年 RNG 論争があり、開発側は「RNG はむしろ習熟に必要なスキルを上げる」と主張 — [PCGamesN](https://pcgamesn.com/hearthstone-heroes-of-warcraft/blizzard-hearthstone-rng-actually-increases-the-level-of-skill-required-to-master-the-game) / [Gangles: Hearthstone randomness](https://gangles.ca/2016/09/12/hearthstone-randomness/)

### Inferences
- Smash Up の基地もランダム性が高いので、デジタル版では「基地プールから毎回複数を公開して選ばせる/禁止できる」「基地効果の強弱幅を抑える」「片方だけに不利な基地を減らす（両者に対称に効く効果を基本にする）」などでロケーションRNG批判を回避できる。
- 相手のプレイを完全に無効化する効果（ハードカウンター）は、短時間・同時ターンでは対処手段がないため不快感が強い。弱体化・遅延程度に留め、必ず残り時間内に巻き返しの手段がある設計にする。
- 「慣れると単調」対策は、ファクション×ファクションの組み合わせ（Smash Up の強み）と基地の組み合わせで自然に解決しやすい。

### Gaps
- 批判の多くは Steam フォーラムや掲示板（2022〜2024年）の個人投稿であり、全体の世論を代表するとは限らない。Reddit や日本語コミュニティの体系的な評価は今回収集できず。
- Shadowverse、Duel Masters Play's、Inscryption、Balatro に対するゲームプレイ面の批判は今回調査できなかった。

---

## Q7.（スコープ追加）スマホで3〜4人オンライン対戦: 同時手番・待ち時間対策・FFA/バトロワ・ロビーUX・切断時のBot代行

### Takeaway
多人数では「待ち時間（downtime）」が人数に比例して悪化するため、成功例は (a) 全員同時に選んで一斉公開（7 Wonders / Sushi Go のドラフト、Snap 型リビール）、(b) 全員同時の準備フェーズ＋ペア対戦（Hearthstone Battlegrounds / TFT）、(c) 非同期＋持ち時間制（Board Game Arena）のいずれかで解決している。FFA は「順位制（1位〜N位）」と早期脱落→即再キューで負けの痛みを軽くしている。切断は「持ち時間切れ→スキップ/除外」か「Bot代行」で処理するが、Bot が遅い・弱いとプレイヤー体験を損なう。

### Cited Findings
- **同時ドラフト**: Sushi Go は 7 Wonders / Fairy Tale のドラフトを20分ゲームに凝縮。各パスで全員が手札から1枚選び、全員選んだら同時公開。2〜5人対応、手札枚数を人数で調整（2人10枚、3人9枚、4人8枚、5人7枚）、3ラウンド制、15〜20分 — [Meeple Mountain: 7 Wonders review](https://www.meeplemountain.com/reviews/7-wonders-review-a-monumental-design/) / [Zatu: Sushi Go](https://zatu.com/products/sushi-go) / [Boardgaming.com: Sushi Go 2nd ed.](https://boardgaming.com/games/card-games/sushi-go-second-edition)（※「同時選択で人数が増えても待ちが増えない」「手札枚数調整でラウンド長を一定に保つ」は検索結果ツールによる推論であり出典の明言ではない）
- **Hearthstone Battlegrounds（8人FFA）**: 各ラウンドは酒場での募集フェーズ（recruit）→他プレイヤー1人と自動戦闘、の繰り返し — [PC Gamer: How to play Battlegrounds](https://pcgamer.com/how-to-play-hearthstones-battlegrounds-mode)
- Battlegrounds 開発陣（Dean Ayala ら）:「楽しくするには8人が必要だと分かっていた」。1v1にない社交的なグループ体験を狙った。バトルロイヤル同様、早期脱落してもすぐ再キューできるので、1v1より負けの痛みが小さい。8人対応はサーバー側の安定化に大きな工数を要した — [Game Developer: Why the Hearthstone devs wanted to make an auto battler](https://gamedeveloper.com/design/why-the-i-hearthstone-i-devs-wanted-to-make-an-auto-battler)
- Battlegrounds Duos 開発時、HP/アーマーの共有、同時に戦うか、カード受け渡しを試行。Trios/Quads にしなかった理由は「考慮すべき盤面が2つだけの方が戦略を立てやすい」(Mitchell Loewen) — [Digital Trends](https://digitaltrends.com/?p=3458971)（検索結果要約より）
- **TFT の設計の柱**: Mastery（知識・柔軟性・運の管理 fortune・読み perception・速さ。クリック精度や反応速度は重視しない）、Playful Competition、Discovery。毎ラウンド1人とペアになり相手のアリーナで戦う。Little Legends のエモート・ダンスで社交性。共有ドラフト「カルーセル」では全員が回転する10体から数秒で奪い合う — [TFT /dev: Design Pillars of TFT](https://teamfighttactics.leagueoflegends.com/en-gb/news/dev/dev-design-pillars-of-tft)
- TFT はカルーセル内容を変えて「適応力を最も報われるスキルにする」方針 — [TFT /dev: Galaxies systems update](https://teamfighttactics.leagueoflegends.com/en-us/news/dev/dev-teamfight-tactics-galaxies-systems-update/)
- **Board Game Arena（多人数ボドゲの非同期/リアルタイム）**: リアルタイム（live）と非同期（turn-based）の2モード。持ち時間は分単位（リアルタイム）/日単位（非同期）で、手番ごとに加算、上限は初期値。持ち時間がマイナスになると他プレイヤーがその人の手番をスキップでき、離脱者は短時間で除外・不戦勝処理できる設計。除外は任意で、まず復帰を促す方が良いとしている。持ち時間なしはフレンド戦以外非推奨（離脱者をスキップできないため） — [BGA Doc: Game clock](https://en.doc.boardgamearena.com/Game_clock)（※公式に deprecated 表記あり、現行FAQ要確認）
- BGA ユーザーの不満: 非同期で相手がタイムアウトし続ける、スキップを最下位の人が恣意的に使える（合意制を求める声）、リアルタイム→非同期変換後の短い非アクティブ制限で試合がキャンセルされる — [BGA forum: timing out](https://forum.boardgamearena.com/viewtopic.php?p=149519) / [BGA forum: inactivity limit](https://forum.boardgamearena.com/viewtopic.php?p=227519)
- **ルームコード/プライベート戦**: Exploding Kittens アプリは後からオンライン対戦を追加し、ランダムマッチに加えホストが共有するコードでのプライベート戦に対応 — [TouchArcade](https://toucharcade.com/2016/03/16/exploding-kittens-finally-has-online-multiplayer-including-private-games)。レビューの主な不満は「知らない人との対戦での時折の切断」 — [Stuff.tv review](https://www.stuff.tv/app-reviews/exploding-kittens/review)
- **切断時の Bot 代行**: Ticket to Ride アプリの更新履歴に「ゲーム開始時にプレイヤーを置き換えた bot の挙動修正」があり、Bot置換を採用 — [diandian (Google Play changelog)](https://app.diandian.com/app/q4kdipurgox2cwn/googleplay-ver)。Catan Universe ではネット不調のプレイヤーが長い待機の後 AI に置換され、その AI も手番に時間がかかる、離脱でレート減といった不満 — [Steam: Catan Universe](https://steamcommunity.com/app/544730/discussions/0/1354868867727022420) / [Steam](https://steamcommunity.com/app/544730/discussions/0/1742227264206438819)。他作品でも「通知なしで友人がAIに置き換えられた」不満 — [Stardock forum](https://www.stardock.com/games/article/474457/friend-randomly-kicked-out-of-multiplayer-game-and-replaced-by-ai-without-n)

### Inferences
- 4人スマホ対戦では、交互ターン（1人30秒×3人待ち＝90秒の待機）は致命的になりやすい。Compile × Smash Up 系なら「全員が同時に裏向きでカードを基地/プロトコルに配置 → 優先権順に一斉公開・解決」（Snap型）か、「同時ドラフト＋同時配置」を基本にすると待ちがほぼゼロになる。
- 交互ターンを残す場合の待ち時間対策: 他人の手番中も自分の手札・次の計画を操作できる（先行入力）、他人の手番中にも反応できるイベント（Smash Up の基地得点で全員が関与）、手番タイマーを短く（15〜30秒）、解決アニメはスキップ/倍速可能に。
- FFA の負けを軽くするには「順位ポイント制（1位〜4位すべてに意味）」や、Battlegrounds のような1ラウンド内のペア対戦構造が使える。4人で直接攻撃し合う場合は「首位叩き」「キングメイカー」問題が出るため、基地（共有目標）を奪い合う間接的インタラクション（Smash Up の基地得点はまさにこれ）が相性が良い。
- 多人数ではペア対戦の方が盤面認知が軽い（Battlegrounds Duos の「盤面2つが限界」発言）。スマホ画面で4人分の盤面を同時表示するより、「共有の基地列＋自分の手札＋他人は要約（得点・手札枚数）」のレイアウトが現実的。
- ロビーUX: ルームコード（短く、紛らわしい文字を除く）＋共有リンク、ホストが開始、空席は Bot で埋めて開始可、Ready 表示。
- 切断: 猶予（例: 30〜60秒）中はタイマー継続→期限切れで Bot が即座に（遅延なく）代行、本人が復帰したら席を返す、Bot代行中であることを全員に通知（無通知置換は不満の元）。Bot は「高速・無難」な手を打つ簡易AIで十分。

### Gaps
- Battlegrounds の募集フェーズのタイマー設計、TFT のラウンド長、Uno 公式アプリ・Exploding Kittens の Bot 代行仕様についての公式資料は見つからなかった。
- 7 Wonders デジタル版や 7 Wonders Duel アプリの多人数UX評価は今回未調査。
- 4人同時リビール型カードゲーム（Snap 型を多人数化した商用例）の具体例は見つからなかった。

---

### 付記: 調査で未カバーの範囲（全体）
- Ben Brode の GDC 講演本体（gdcvault 会員限定）、Anthony Giovannetti「Slay the Spire: Metrics Driven Design and Balance」（GDC 2019）本体は未視聴。後者の概要: 早期からメトリクス重視、Early Access中もデータ駆動で調整、コミュニティフィードバックとの付き合い方 — [GDC news](https://gdconf.com/news/learn-slay-spires-successful-metrics-driven-approach-game-balancing-gdc-2019) / [Game Developer](https://www.gamedeveloper.com/design/learn-i-slay-the-spire-i-s-metrics-driven-approach-to-game-balancing-at-gdc-2019)
- Ascension アプリ、Inscryption、Shadowverse、4Gamer/ファミ通の日本語開発者インタビューは今回の調査件数内で有用な一次情報を得られなかった。
