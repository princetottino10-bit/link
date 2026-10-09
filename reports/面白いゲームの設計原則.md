# 面白いゲームは「苦しい選択」と「最後まで読めない勝敗」で決まる

カード・ボードゲームの面白さは、主に二つの条件から生まれる。一つは**毎手番に「何かを諦める」状況依存の選択があること**、もう一つは**勝敗の見通しはあるのに最後まで確定しないこと**である。高評価作の多くは、この二つを「1枚のカードに複数の用途」「並列する局地戦（レーン／基地）」「コミットのタイミング」「伏せ札による読み合い」「15〜30分の短さ」といった少数のパターンの組み合わせで実現している。4人対戦では、2人対戦にない固有の失敗要因が三つ加わる。**キングメイキング、リーダー叩き、ダウンタイム（自分の番以外の待ち時間）**である。成功作は共通して、「誰を攻撃するか」の自由度を絞る（共有の基地や隣席限定）、得点の見通しをほどほどに曖昧にする、全員が同時に選んで一斉に公開する、といった構造で対処している。スマホのオンライン対戦では、試合の上限時間が保証されていること、同時公開、画面上のテキストが極めて少ないこと、相手を待たせない操作省略が設計の柱になる。バランス調整は、紙での高速な試作、観察中心のプレイテスト、AIシミュレーションによる外れ値検出の三つを組み合わせて回すのが現時点の最適解である。席順の有利不利のように**人間のテストでは統計的に検出できない問題**は、シミュレーションに任せるしかない。Compile × Smash Up の4人版は、「表＝効果／裏＝固定値」の二択、共有の基地、全順位への得点配分、同時配置と一斉公開を核にすると、両作の長所を活かしつつ4人戦特有の弱点を避けやすい（この部分は推論）。

---

## 面白さの理論は「感情から逆算し、曖昧な決定を作る」に収束する

ゲームデザイン理論は数多くあるが、実務に効く結論はほぼ一致している。MDA フレームワークは、ゲームを**メカニクス（ルール）→ダイナミクス（プレイ中に生じる振る舞い）→エステティクス（プレイヤーの感情）**の3層で捉える。デザイナーはメカニクス側から、プレイヤーは感情側から体験するので、狙う感情を先に決めてから仕組みを逆算する「体験駆動」の設計が推奨される ([MDA paper](https://users.cs.northwestern.edu/~hunicke/MDA.pdf))。MDA は「楽しさ」を感覚・空想・物語・挑戦・仲間意識・発見・表現・暇つぶしの8種に分け、ゲームはこれらを異なる比率で追求するもので「面白さの公式」は存在しないとする。そのうえで競争的なゲームには**「誰が勝っているかの明確なフィードバック」が不可欠**であり、勝てないと感じた瞬間にゲームは急に面白くなくなると指摘している。モノポリーは、リーダーが富むほど他者をより効果的に罰せる正のフィードバックによって劇的緊張とエージェンシー（自分の行動が結果を左右している感覚）を失う例として挙げられ、対策に遅れた側への補助、リーダーへの課税、時間的圧力による早期決着が提案されている。ただし、補正の計算が複雑すぎると順位を追えなくなるという注意も付く ([MDA paper](https://users.cs.northwestern.edu/~hunicke/MDA.pdf))。

「興味深い決定」の中身を最も具体的に示したのは Sid Meier である。GDC 2012 の講演で彼は、3択で常に1番目を選ぶ決定や、ランダムに選ぶしかない決定は面白くないと定義した。そのうえで良い決定の要素に、**トレードオフ、状況依存性、プレイスタイルの表現、結果の持続性、リスク対リターン、短期対長期**を挙げている。さらに「情報は多すぎる側に倒せ」「決定への最悪の反応は無反応」と述べ、アイデアの約1/3は面白さが足りず削除されると語った ([Game Developer](https://www.gamedeveloper.com/design/gdc-2012-sid-meier-on-how-to-see-games-as-sets-of-interesting-decisions))。Keith Burgun はこれをさらに進め、ゲームを「**曖昧な意思決定の競争**」と定義した。良い決定とは、より良い答えが曖昧なものだという ([Game Developer](https://www.gamedeveloper.com/design/what-makes-a-game-))。

これを補うのが学習と不確実性の理論である。Raph Koster はパターンの発見と習得を楽しさの源とみなす。パターンを学び尽くすと退屈になるので、長く遊ばれるには習得し切れない深さが要る ([Tale of Tales review](https://www.tale-of-tales.com/DramaPrincess/wp/?p=120))。Greg Costikyan は、ゲームが関心を保つには不確実性が必要だとし、その源を乱数に限定しない。相手の予測不能性、分析的複雑さ、隠匿情報、物語的期待（終盤の逆転）など10種類以上を挙げている ([Liz England review](https://lizengland.com/blog/review-uncertainty-in-games-by-greg-costikyan/))。ランダム性の扱いについては、Geoffrey Engelstein の**入力ランダム性（決定の前に起きる乱数、例：手札のドロー）と出力ランダム性（決定の後に起きる乱数、例：攻撃ダイス）**の区別が定番である。「入力は戦略を支え、出力は計画を損なう」が一般論だが ([arXiv 2107.08437](https://arxiv.org/pdf/2107.08437))、よく調整された出力ランダム性はゲームを良くするという反論もあり、両方を道具として使い分けるべきという立場が有力になっている ([Skeleton Code Machine](https://www.skeletoncodemachine.com/p/input-output-randomness-part-2))。Marvel Snap の Ben Brode も「運と実力は一本の軸の両端ではない」と述べ、高運・高実力のゲームは毎回違う判断が生まれて特に楽しいとしている ([mobilegamer.biz](https://mobilegamer.biz/second-dinners-ben-brode-reveals-marvel-snaps-recipe-for-success-literally/))。

心理面では、自己決定理論（SDT）の三つの欲求、つまり**自律性・有能感・関係性**が、それぞれ独立にゲームの楽しさと将来のプレイを予測することが実証されている ([Ryan, Rigby, Przybylski 2006](https://www.rochester.edu/warner/lida/wp-content/uploads/2022/11/02bfe513dd59366750000000.pdf))。カード単位でこれを実装する技法が Mark Rosewater の**レンティキュラー・デザイン**である。初心者には単純に、熟練者には深く見えるカードを作る手法で、複雑さを「理解」「盤面」「戦略」の3種に分け、前の二つを低く保ったまま戦略的深さを初心者の目に入らない場所に置く ([Making Magic: Lenticular Design](https://magic.wizards.com/en/news/making-magic/lenticular-design-2014-12-15))。

| 理論 | 設計への翻訳 | 「おもしろいゲーム作り」での使い方 |
|---|---|---|
| MDA | 狙う感情を2〜3個決め、それを生む振る舞い→ルールの順に作る | 企画の最初に「挑戦＋発見＋表現」のように感情の組み合わせを宣言する |
| Meier／Burgun | 決定にはトレードオフ・状況依存・持続性・曖昧さが要る | カードごとに「何を諦めさせるか」「どの状況で強弱が逆転するか」を書き出す |
| Koster | 解けたゲームは死ぬ。新しいパターンを段階的に供給する | 支配戦略を探すことをテストの最優先にする |
| Costikyan／Engelstein | 不確実性は多源的。入力ランダム性を主軸にする | ドローや場の公開は判断の前に置く。判断後のダイスは山場の演出に限る |
| SDT | 自律性・有能感・関係性を満たす | 複数の勝ち筋、上達が見える結果、卓の会話を生む仕組みを入れる |
| レンティキュラー | 表面は単純、深さは相互作用とタイミングに置く | カードの文面は短く、強さは組み合わせから生まれるようにする |

---

## 高評価作は10個の共通パターンのうち2つ以上を組み合わせている

レビューやデザイナーの発言を作品横断で比べると、「面白い」と評される瞬間は三種類に大別できる。一つ目は**相手の手を読み切った瞬間や罠が刺さる瞬間**、二つ目は**連鎖で盤面が大きく動く瞬間**、三つ目は**どれを渡すかの苦渋とその後の苦笑い**である。それを生む構造は少数のパターンに集約される。

| パターン | 代表例 | 生まれる面白さ |
|---|---|---|
| 多用途カード（1枚で2〜3通り） | Compile／Air, Land & Sea の「表＝効果／裏＝値2」、Twilight Struggle のイベント／作戦値、Dune: Imperium の上段／下段 | 毎手番が「どれを捨てるか」のジレンマになる |
| レーン／ゾーン多数決（並列する局地戦） | Compile の3レーン、Battle Line の9旗、Hanamikoji の7芸者、Smash Up の基地 | 負けそうな局地戦から撤退する判断、リソース配分の読み合い |
| コミットのタイミング | Battle Line、Lost Cities の−20点、Jaipur の売り時、Compile のリフレッシュ | 早すぎれば読まれ、遅すぎれば間に合わない緊張 |
| 分けて選ばせる（I split, you choose） | Hanamikoji の贈呈／競争 | 相手に選択を委ねることで読み合いが生まれる |
| 相手に開けてしまう共有の場 | 7 Wonders Duel のピラミッド、Jaipur の市場、Lost Cities の捨て札 | 取ることが相手に何かを渡すという拒否のジレンマ |
| 伏せ札・非対称によるブラフ | Netrunner、Compile の Smoke、Hanamikoji の秘密 | 心理戦。初心者でもすぐブラフを始める |
| モジュール混合 | Smash Up のシャッフルビルディング、Compile のプロトコルドラフト | 構築の負担なしにデッキ構築感を得られる。組み合わせの発見 |
| 複数勝利条件・即勝利の脅威 | 7 Wonders Duel（軍事・科学・得点） | 無視できない常時の脅威 |
| 綱引きトラック | 7 Wonders Duel の軍事、Watergate | 一進一退が目に見える |
| 短時間・小さな山札・ラウンド制 | Compile 18枚、Hanamikoji 21枚、Love Letter 16枚 | すぐ再戦できる。運への不満が和らぐ |

ユーザーが参考にする2作については、レビューが長所と短所をはっきり示している。**Compile** は、12種のプロトコル（各6枚）から3つずつドラフトして18枚の山札を作る。カードは対応レーンに表向きで出して効果を使うか、任意のレーンに裏向きで出して値2として使うかを選ぶ。レーンの合計が10以上で相手より高くなると「コンパイル」が起き、そのレーンの両者のカードが全部消える。3つコンパイルした方が勝ちである ([Opinionated Gamers](https://opinionatedgamers.com/2024/09/03/dale-yu-review-of-compile-main-1/))。レビュアーが挙げる魅力は三つある。プロトコル同士の組み合わせを手札を通じて発見する過程、コンパイルで場が消えるので負けレーンへの過剰投資を避ける判断、そして各プロトコルが独自の「ミニゲーム」になっていることで、Main 1 と 2 を混ぜると組み合わせは**2,024通り**になる ([Meeple Mountain](https://www.meeplemountain.com/reviews/compile-main-2/))。批判は、プロトコルの概要をまとめたプレイヤーエイドがなくカードを探って覚えるしかないこと、学習曲線が急なことに集まっている ([Opinionated Gamers](https://opinionatedgamers.com/2024/09/03/dale-yu-review-of-compile-main-1/))。

**Smash Up** は20枚の派閥デッキを2つ混ぜてシャッフルし、共有の基地にミニオンを出す。合計パワーがブレイクポイントに達すると、順位に応じて得点が入る。デザイナーの Paul Peterson は、CCG のデッキ構築は魅力的だが気後れするほど大変なので、カスタマイズの感覚を圧倒されずに得る方法としてシャッフルビルディングを考えたと語っている ([Theology of Games](https://www.theologyofgames.com/blog/tag/Paul+Peterson))。クトゥルフ拡張の Madness カードは基本的に持ち主に不利だが、「いくつかの派閥は実際にそれを欲しがるようにした」。共通リソースの意味を派閥ごとに変えるこの手法は、少ない追加ルールで派閥差を出す好例である ([Theology of Games interview](https://www.theologyofgames.com/2013/06/27/a-double-take-interview-with-paul-peterson-and-todd-rowland/))。一方で、変数が多すぎて紙とペンが事実上必須になり、計算がペースを落として「massively frustrating」だという批判がある ([God is a Geek](https://godisageek.com/2014/11/smash-review/))。4人戦では、得点が通常上位3人までなので**4位が無得点になりやすい**こと、カードテキストの負荷が重いことも指摘されている ([Board Game Quest](https://www.boardgamequest.com/smash-up-review/))。

リプレイ性の源泉も整理できる。モジュールの組み合わせ（Compile、Smash Up）、配置や山札のランダム性、相手という変数、段階的に解放される内容（Sky Team の20ミッション）の四つである。逆に、仕掛けを理解したら終わるゲームは寿命が短い。The Mind は「コツが分かると魔法が早く消える」と批判されている ([Roll to Review](https://rolltoreview.com/the-mind-card-game-review/))。Lost Cities や Battle Line のような固定カードの小品は、ランダムな配札と相手の読み合いだけで長寿命を保っている。**相手が最大の変数になれば、コンテンツ量は少なくて済む**ということだ。プレイ時間は、2人用の高評価作では15〜45分に集中している。重量級の Twilight Struggle でさえ、設計動機は「従来作より速くシンプルに」だった ([The Forge](https://theforge.defence.gov.au/wargaming/wargame-design-decisions-twilight-struggle-and-elsewhere))。

---

## つまらなさの原因は12のアンチパターンに分解でき、処方箋も確立している

批評家とプレイヤーの不満は、運、長考・重さ、管理の手間、インタラクションの薄さの4系統にほぼ集約される。設計上の原因と処方箋を対応づけると次のようになる。

| アンチパターン | 症状 | テストでの検出法 | 主な処方箋（実例） |
|---|---|---|---|
| ランナウェイリーダー（雪だるま） | 中盤で勝者が分かり、残りが消化試合になる | 中盤の首位が最終首位になる割合を記録する | 前進するほど苦しくなる「向かい風」（Dominion の勝利点カードがデッキを弱くする）、複数の勝ち筋、加速終了 ([League of Gamemakers](https://leagueofgamemakers.com/ask-the-league-should-games-have-a-catch-up-mechanic)) |
| 過剰なキャッチアップ | 上手いプレイが罰せられ、わざと控える人が出る | 「得点を控えた」行動が見られるか | 追い上げは絆創膏にすぎない。部品そのもののバランスで解決する（同上） |
| 長考（AP）・ダウンタイム | 待つ側がスマホを見始める | 手番時間をストップウォッチで計る | フェーズ分割、選択肢の制限、隠し情報、計算をトラック化、同時手番など10の手法 ([League of Gamemakers Part 2](https://www.leagueofgamemakers.com/designing-games-to-prevent-analysis-paralysis-part-2)) |
| マルチプレイヤー・ソリティア | 他人がいる意味がない | 他人の行動で計画が変わった回数を数える | 共有資源の取り合いなど間接インタラクションにする。Dominion は「角度をつけた鏡に手を振っている」と評された ([There Will Be Games](https://therewillbe.games/boardgames-main-menu/boardgame-directory/dominion_l765?rating=3)) |
| 過剰なテイク・ザット | 恨み、標的化、報復の連鎖 | 「狙われた」という感想が出る | 攻撃に自分のコストを課す。攻撃対象を固定する |
| 脱落 | 脱落者が待つだけになる | 脱落から終了までの時間を測る | 1ラウンド数分のゲームに限る（Love Letter は許容され、Bang! は最大の批判点） ([Tampere PlayLab](https://blogs.tuni.fi/playlab/game-reviews/ode-to-the-shoot-outs-of-spaghetti-westerns-bang-review/)) |
| 支配戦略・壊れたコンボ | 全員が同じ戦略をとる | 勝者の戦略の採用率と勝率を集計する | 回数制限、上限、禁止。Oko はメタとプレイパターンの多様性を下げたとして禁止された ([Wizards](https://magic.wizards.com/en/news/announcements/november-18-2019-banned-and-restricted-announcement?2)) |
| ランダム性の過多・資源事故 | 「引きが悪かった」が敗因の大半を占める | 何もできなかったターン数を数える | 資源の自動増加（Hearthstone）、固定エネルギーと撤退、確定初手カード（Marvel Snap） ([mobilegamer.biz](https://mobilegamer.biz/second-dinners-ben-brode-reveals-marvel-snaps-recipe-for-success-literally/)) |
| 情報過多・面倒な管理 | 処理忘れ、計算地獄 | ルールブックを参照した回数、処理忘れの回数 | 一貫したメカニクス、トークン・トラック化、視覚情報の削減 ([League of Gamemakers Part 1](https://leagueofgamemakers.com/designing-games-to-prevent-analysis-paralysis-part-1)) |
| 盛り上がらない終盤・膠着 | 投了、離席 | 「勝敗が分かった時点」を全員に聞く | 決着点で終える、隠し得点、時間とともに伸びる力、ラウンド上限 ([Law of Game Design](https://lawofgamedesign.com/2014/10/08/theory-concession-proofing-your-game/)) |
| 意味のない手番（自動操縦） | 選択肢がない、または差がない | 「他の手を検討したか」を記録する | 選択肢の「数」ではなく「差」を設計する。全手が等価に強いと後悔と AP を生む（New York 1901） |
| フィールバッド効果 | 「何もできなかった」 | 被害側が投了を考えた瞬間を聞く | 否定ではなく遅延にする、失った分を補填する、重いコストを課す ([Hipsters of the Coast](https://www.hipstersofthecoast.com/2022/02/counter-them-softly-in-commander/)) |

なかでも、カードゲームで繰り返し問題になるのが**フィールバッド効果**である。Rosewater は、打ち消し（カウンター）が大多数のプレイヤーにとって楽しくないゲームプレイを生むと考えている ([Hipsters of the Coast](https://www.hipstersofthecoast.com/2022/02/counter-them-softly-in-commander/))。手札破壊がつらいのは、負けることよりも「現在の機会を失う」ことの方が痛く、戻る道がないと感じさせるからだと分析されている ([Hipsters of the Coast](https://hipstersofthecoast.com/2023/06/the-feelbadism-of-discard))。Hearthstone の Discover は、当初の「デッキトップに置く」案が「次ターンに答えを引けない」と分かってしまう無力感を生んだため、シャッフルする形に変更された ([Wowhead](https://ru.wowhead.com/news/ben-brode-and-dean-ayala-talk-about-creating-the-discover-mechanic-250903))。**勝率に影響がなくても体験の悪さは別の指標で測る必要がある**というのが、ここから得られる教訓である。

先手有利については、補償は過剰になりやすい点に注意が要る。Nim などの数学的研究では、「後手に追加手番」を与える補償が多くの局面で逆に後手を明確に有利にした ([Minnesota Journal of Undergraduate Mathematics](https://pubs.lib.umn.edu/index.php/mjum/article/download/4152/2843/19124))。補償を入れたら必ず測り直す必要がある。

---

## 4人対戦では「誰を攻撃できるか」と「待ち時間」が最大の設計変数になる

4人戦の問題の根は、Lewis Pulsipher の「Three-Player Problem」にある。3人以上の対立ゲームでは遅れている者同士が組んでリーダーを叩くので、新しいリーダーが叩かれ続ける「終わらないゲーム」、争いに加わらなかった者の漁夫の利、キングメイキングが構造的に起きる ([Skeleton Code Machine](https://www.skeletoncodemachine.com/p/three-player-problem))。関連して、防御に籠もる亀戦法（マップが人数に対して広いと容易になる）や、標的にならないよう好調を隠すサンドバッギングも起きる。デザイナー調査では、「最悪の問題」として**キングメイキング42%、リーダー叩き23%**が挙がり、亀戦法は0%だった ([Skeleton Code Machine](https://www.skeletoncodemachine.com/p/is-kingmaking-cursed))。Riot の Alex Jaffe は GDC 2019 で、キングメイキングを「呪われた問題（cursed problem）」と位置づけた。これはプレイヤーへの約束同士の衝突に根ざす問題で、完全には解決できず、ゲームの約束そのものを変えて回避するしかない ([GDC Vault](https://gdcvault.com/play/1025756/Cursed-Problems-in-Game))。彼の4技法は、約束破りにつながる行動を制限する Barriers、成功や得点を隠す Gates、2位以下にも報酬を出す Carrots、ゲーム自体を楽しくして交渉の道具を与える Smores である ([Skeleton Code Machine](https://www.skeletoncodemachine.com/p/is-kingmaking-cursed))。一方で Cole Wehrle は、キングメイキングが他勢力との関係を考えさせ物語を生むとして擁護している ([GDC Vault: "King Me"](https://www.gdcvault.com/play/1025683/contactUs))。したがって「政治を楽しむゲーム」にするのか「純粋な腕比べ」にするのかを、最初に決めることが重要になる。

実務で最も使いやすいのは、René Wiersma の「**最悪のキングメイキングの3条件**」である。(1) そのプレイヤーの手が他者間の勝敗を決める、(2) どの手を選んでも本人の順位は改善しない、(3) 本人がそれを自覚している。この**どれか1つを崩せば影響は減る** ([BGDF](https://bgdf.com/forum/archive/archive-game-creation/topics-game-design/tigd-kingmaking-common-problem-2))。順位点を4位まで配れば条件2が崩れ、得点を部分的に隠せば条件3が崩れる。Time of Crisis では、先頭を叩く行動が攻撃者自身の目標の前進にもなるため私怨と見なされない ([The Thoughtful Gamer](https://thethoughtfulgamer.com/2017/09/16/losing-propositions/))。

4人カードゲームで最も効く設計変数は、**カードの対象指定の書き方**である。

| 対象の書き方 | 政治・ヘイト | 長所 | 注意点・実例 |
|---|---|---|---|
| 共有の場所（基地・レーン）単位 | 低い | 「誰を殴るか」ではなく「どこに置くか」の競争になる | Smash Up の基地は1〜3位に得点する ([Smash Up rules](https://cdn.shopify.com/s/files/1/2546/6116/files/rules-smash-up.pdf)) |
| 各対戦相手（全員） | 低い | 公平 | 効果が3倍になるので数値は小さくする |
| 隣席限定（左／右） | 低い | 政治が消え、追う範囲が狭い | 7 Wonders の軍事は両隣とのみ争う ([BGA](https://en.boardgamearena.com/news?id=388))。MTG の Free-for-All も「左を攻撃」などで範囲を制限する ([MTG Wiki](https://mtg.wiki/page/Free-for-All)) |
| 対戦相手1人を選ぶ | 高い | ドラマが生まれる | 先頭叩きや報復を生む。「最も得点が高い人」のように対象を自動で決めて誘導する |
| 役職・役割を指定 | 中程度 | 間接的になり当て推量が要る | Citadels の暗殺者は人ではなく役職を指定する ([Miniature Market](https://miniaturemarket.com/reviewcorner/citadels-review)) |
| 強制攻撃 | — | — | MTG の扇動（Goad）は「ミスプレイを強いられる」と批判される ([Card Kingdom](https://blog.cardkingdom.com/the-real-impact-of-multiplayer-mechanics-in-magic/))。「〜せよ」ではなく「〜すれば報酬」の形にする |

ダウンタイムは人数に比例して悪化する。1手番2分なら、6人戦では自分の番まで約10分待つ計算になる ([Brain Games](https://brain-games.com/blogs/board-game-explorer/how-player-count-impacts-game-design))。Antoine Bauza は、大半のユーロゲームが4人前提で、人数を増やすとダウンタイムが楽しさを上回るという問題を解くため、7 Wonders を全員同時のドラフトで設計した ([Miniature Market](https://www.miniaturemarket.com/7wondersreview.html))。各時代の7枚目は捨てられるので総手番数は常に18で、人数を増やしても遅くならない ([Strange Assembly](https://www.strangeassembly.com/?p=2334))。4人で好評な作品には少なくとも二つの共通点がある。**同時性**（待たせない）、**他人の手番中の意思決定**（Coup のチャレンジ、Cosmic Encounter の同盟招待）、**先頭が誰か曖昧であること**（Ticket to Ride の非公開目的地チケット）の三つのうち、二つ以上を満たしている ([Strange Assembly: Coup](https://www.strangeassembly.com/?p=4870); [Tampere PlayLab: Ticket to Ride](https://blogs.tuni.fi/playlab/game-reviews/ticket-to-ride-a-game-that-takes-you-on-an-adventure/))。

**2対2のチーム戦**は、キングメイキングを構造的に消す有力な選択肢である。全員が最後まで勝敗に関与するからだ。Tichu のように、勝敗を共有しつつ互いの手札が見えないので味方の傾向を学ぶ必要がある構造は、繰り返し遊ぶ動機になる ([There Will Be Games: Tichu](https://therewillbe.games/articles-analysis/8536-abstraction-tichu))。MTG の双頭巨人戦（Two-Headed Giant）は、チームでライフ30を共有し、他の資源は共有せず、チーム単位で同時にターンを進める ([Wizards](https://magic.wizards.com/en/formats/two-headed-giant))。「勝敗資源は共有、行動資源は個別」が典型形である。注意点として、1人がチームの決定を支配しがちな問題があり、手札の非公開や会話の制限が対策になる ([BGDF](https://www.bgdf.com/forum/game-creation/design-theory/team-based-gaming))。Hearthstone Battlegrounds Duos を4人や6人のチームにしなかった理由は「考慮すべき盤面が2つだけの方が戦略を立てやすい」からだった ([Digital Trends](https://digitaltrends.com/?p=3458971))。これは**スマホ画面に4人分の盤面を並べない**根拠にもなる。

席順の影響は2人戦より大きく出る。MTG 統率者戦の4人卓約24.4万試合では、勝率が1番席29.2%、2番席25.7%、3番席23.6%、4番席21.5%で、席が後になるほど単調に下がった ([Playgroup.gg](https://playgroup.gg/commander/turn-order))。ところが Agricola では、3〜4人戦で2番席が1番席より成績が良い ([BGA forum](https://forum.boardgamearena.com/viewtopic.php?p=127163))。**傾向はゲームごとに違うので、必ず自作ゲームで測る**必要がある。

---

## スマホ対戦は「上限時間の保証」と「同時公開」と「8語ルール」で設計する

Marvel Snap の Ben Brode は、Clash Royale について「5分あれば100%確実に1戦できる」ことを重視し、Snap も同じ目標で設計した ([mobilegamer.biz](https://mobilegamer.biz/second-dinners-ben-brode-reveals-marvel-snaps-recipe-for-success-literally/))。Snap は**6ターン固定・同時プレイ・1ラウンド約35〜40秒**で、試合の最大長を約3〜4分に固定している。交互ターン制では、片方が急ぎ片方が遅いとどちらかが苛立つが、同時ターンはこの待ち時間をほぼ消す。ターンタイマーは End Turn ボタン自体に統合されている ([Game Developer](https://www.gamedeveloper.com/game-platforms/designers-don-t-sleep-on-marvel-snap-s-simultaneous-turns))。短さの本質は、平均時間の短さより**上限が保証されていること**にある。Clash Royale は通常3分で、ラスト1分はエリクサー（行動資源）の生成が2倍になり、試合のテンポが「読み合いから総力戦へ」と段階的に上がる ([Game Developer](https://www.gamedeveloper.com/design/clash-royale---deconstructing-supercell-s-next-billion-dollar-game))。時間とともに緊張が上がる曲線は、短い試合でもクライマックスを作る。デュエル・マスターズ プレイスは、紙の TCG ルールを踏襲しつつ、テンポ向上と操作の省略を目的に、何もできなくなったら自動でターンを終える処理や持ち時間制限を入れた ([デュエマwiki](https://www.dmwiki.net/%E3%83%87%E3%83%A5%E3%82%A8%E3%83%AB%E3%83%BB%E3%83%9E%E3%82%B9%E3%82%BF%E3%83%BC%E3%82%BA+%E3%83%97%E3%83%AC%E3%82%A4%E3%82%B9))。

運の受け入れやすさについては、Snap の**スナップ（倍賭け）と撤退（Retreat）**が最も示唆に富む。バックギャモンのダブリングキューブを借りたこの仕組みでは、悪い試合は小さな負けで切り上げ、良い試合は大きな勝ちに膨らませる。Brode は「勝率がマイナスでも、勝つとき8キューブ得て負けるとき1キューブしか失わないプレイヤーはランクを駆け上がる」と述べている ([Kotaku via Yahoo](https://malaysia.news.yahoo.com/marvel-snap-creator-says-players-160600890.html))。撤退時の表示を「You Lose!」から「**Escaped!**」に変えたのは、実装コストほぼゼロで効く感情設計の例である ([mobilegamer.biz](https://mobilegamer.biz/second-dinners-ben-brode-reveals-marvel-snaps-recipe-for-success-literally/))。ちなみに Snap の「ロケーション」は、Smash Up の能力付き基地から着想されている（同上）。ただし Snap には、ロケーションの重いランダム性のせいでカードを出す前に勝負が決まることがある、同時プレイではカウンタープレイが難しい、相手の戦略を封じるハードコントロールがストレス、といった批判もある ([Steam discussions](https://steamcommunity.com/app/1997040/discussions/0/3551679689864636320))。

小画面での可読性の目安として、Brode は「**画面に8語以上置くとプレイヤーは読まない**」というルールを引用し、Snap は平均11語、Hearthstone は9語で完全には守れていないと認めている ([mobilegamer.biz](https://mobilegamer.biz/second-dinners-ben-brode-reveals-marvel-snaps-recipe-for-success-literally/))。Hearthstone の Eric Dodds が GDC 2014 で示した10原則のうち、特に重要なのは次の三つである。「**Keep it Deep**（複雑さは削り、深さは残す）」、「**Embrace the Medium**（紙のルールをそのまま持ち込まない）」、「**Little Victories**（試合の流れを変えたと感じる瞬間を与える）」 ([80.lv](https://80.lv/articles/hearthstone-10-rules-of-great-design))。Snap では、公開順を決める優先権を、プレイヤー名の光る枠で常時表示している ([PCGamesN](https://www.pcgamesn.com/marvel-snap/who-reveals-first))。「なぜ負けたか」が分かる情報を常に見せることが納得感につながる。Gwent のデザイナーは「**カードを2回説明しなければならないなら、たぶん複雑すぎる**」という基準を使った ([PC Gamer](https://www.pcgamer.com/uk/the-making-of-gwent))。

多人数のオンライン対戦では、交互ターンだと1人30秒としても3人分で90秒待つことになり、致命的になりやすい（推論）。成功例は三つの型のどれかで待ち時間を解決している。全員同時に選んで一斉公開する型（7 Wonders、Sushi Go）、全員同時の準備フェーズとペア対戦を組み合わせる型（Hearthstone Battlegrounds、TFT）、持ち時間制の非同期対戦（Board Game Arena）である。Battlegrounds の開発陣は、早期に脱落してもすぐ再キューできるので1対1より負けの痛みが小さいと述べている ([Game Developer](https://gamedeveloper.com/design/why-the-i-hearthstone-i-devs-wanted-to-make-an-auto-battler))。切断時に Bot が代行する仕組みは一般的だが、Catan Universe では AI への置き換えが遅く、置き換えた AI も手番に時間がかかると不満が出ている ([Steam: Catan Universe](https://steamcommunity.com/app/544730/discussions/0/1354868867727022420))。通知なしに友人が AI に置き換えられたことへの不満もある ([Stardock forum](https://www.stardock.com/games/article/474457/friend-randomly-kicked-out-of-multiplayer-game-and-replaced-by-ai-without-n))。Board Game Arena は持ち時間が尽きた人の手番を他者がスキップできる設計だが、最下位の人がスキップを恣意的に使えるという不満も記録されている ([BGA Doc](https://en.doc.boardgamearena.com/Game_clock); [BGA forum](https://forum.boardgamearena.com/viewtopic.php?p=149519))。ルームコードによるプライベート戦は、Exploding Kittens のアプリが後から追加して対応した例がある ([TouchArcade](https://toucharcade.com/2016/03/16/exploding-kittens-finally-has-online-multiplayer-including-private-games))。

以上から、Web 版の推奨構成は次のようになる（推論）。紛らわしい文字を除いた4〜6文字のルームコードと共有リンクで部屋を作る。手札や山札などの隠匿情報は、サーバー側で管理して相手のクライアントに送らない（サーバー権威）。全員同時の配置と一斉公開を基本にし、タイマーはボタンと一体化する。応答できるカードがないときは自動でスキップし、誘発の連鎖は早送りする。切断時は30〜60秒の猶予の後、高速で無難な Bot が即座に代行し、そのことを全員に通知し、本人が復帰したら席を返す。

---

## カードは「深さ÷複雑さ」で評価し、勢力は「できないこと」で定義する

Rosewater の「ゲームに必要な10のこと」は設計の土台チェックに使える。目標、ルール、相互作用、追い上げ要素、慣性（ゲームが確実に終わる仕組み）、驚き、戦略、楽しさ、フレーバー、フックの10項目である。フックの役割は「教えることではなく興味を引くこと」とされる ([Making Magic: Ten Things Part 1](https://magic.wizards.com/en/news/making-magic/ten-things-every-game-needs-part-1-2011-10-24); [Part 2](https://magic.wizards.com/en/news/making-magic/ten-things-every-game-needs-part-1-part-2-2011-12-19))。GDC 2016 の講演「20年で学んだ20の教訓」の中では、次の教訓がカードデザインに直結する。「人間の本性と戦うのは負け戦」「興味深いと楽しいを混同しない」（カードを捨ててモンスターを強化する案は嫌われた。プレイヤーはカードを使いたい）、「楽しい行動を勝つための正しい戦略にする」、「全員が7点をつけるが誰も愛さないゲームは失敗する」、「シナジーはプレイヤーに発見させる」、「制約は創造性を生む」、「観客は問題を見つけるのは得意だが解決は苦手」 ([GDC Vault](https://www.gdcvault.com/play/1023186/); [講演ノート](https://notes.hamatti.org/sources/talks/'magic-the-gathering'-20-years,-20-lessons-learned-by-mark-rosewater))。プレイヤー像も三つに分けて考える。大きな瞬間を求める Timmy、自己表現を求める Johnny、勝って何かを証明したい Spike であり、全員を喜ばせようとすると誰も喜ばない（同上）。

Ben Brode は、**複雑さ（ルール文の量）と深さ（意味のある判断の量）は別物**だと述べている。Whirlwind、Acolyte of Pain、Frothing Berserker というシンプルなカードの組み合わせから「史上最も難しいデッキの一つ」が生まれたように、「深さ÷複雑さ」の比が高いカードが最良だという ([Hearthstone Top Decks](https://www.hearthstonetopdecks.com/ben-brode-defining-complexity-depth-design-space/))。MTG の New World Order は、新規プレイヤーが最も触れるコモンの複雑さを下げる方針で、目安として「コモンは戦場で他の1枚より多くに影響しない」としている ([MTG Wiki](https://mtg.wiki/page/New_World_Order))。キーワードはフレーバーを与え、2回目以降の読みを速くする ([Inven Global](https://www.invenglobal.com/hearthstone/articles/4797/ben-brode-on-the-witchwoods-most-dangerous-card-its-shudderwock))。既知の概念に便乗した命名（トロイの木馬を思わせる「Akroan Horse」）は、それだけでルール説明の一部になる ([講演ノート](https://notes.hamatti.org/sources/talks/'magic-the-gathering'-20-years,-20-lessons-learned-by-mark-rosewater))。

勢力のアイデンティティは、MTG のメカニカル・カラーパイ（色ごとに効果を主・副・三次に割り当てる表）のように、**できることと同じくらい「できないこと」で定義する** ([Making Magic: Mechanical Color Pie 2021](https://magic.wizards.com/en/news/making-magic/mechanical-color-pie-2021))。Netrunner の Genesis サイクルでは、各勢力の強みと弱みを明確にする方針がとられた（Haas-Bioroid はより防御的、Criminal はより速く、Jinteki はよりトリッキー）。アイデンティティはデッキ構築には大きく影響させても、プレイ中には複雑さではなくフレーバーを足すものにした ([FFG](https://www.fantasyflightgames.com/en/news/2015/6/1/data-and-destiny/))。ラヴニカの2色ギルドが最も人気のあるセットの一つになったことは、Smash Up 型の「2勢力の組み合わせ」の魅力を裏づけている ([講演ノート Lesson 17](https://notes.hamatti.org/sources/talks/'magic-the-gathering'-20-years,-20-lessons-learned-by-mark-rosewater))。特定のカード群とだけ働く寄生的メカニクスは、有無ではなく程度の問題とされる。最近の MTG は「まとまったパッケージ」としてなら受け入れるようになっている ([mtgrocks](https://mtgrocks.com/parasitic-mechanics-increase-mtg/))。

数値の基準づくりには、Ian Schreiber のコストカーブの手順が実用的である。すべての効果をコストと利益に分け、共通の通貨で表し、効果が1つだけのカードから値を決める。1点だけ違うカード同士を比べて未知の値を逆算し、合計して外れ値を探す。最後にプレイテストで検証する。選択式の効果は良いほうの選択肢を基準に値付けする。**迷ったら弱めに作る**。弱いカードは使われないだけだが、強すぎるカードはゲーム全体を壊すからだ ([Game Balance Concepts](https://gamebalanceconcepts.wordpress.com/2010/07/21/level-3-transitive-mechanics-and-cost-curves/))。Slay the Spire は、目標を「**すべてのカードに居場所がある**」と「強すぎて環境を歪めるものを避ける」に置いた。つまらないのに少し安すぎるコモンは、強さよりも「どこにでも入る」という理由で弱体化し、めったに出ない強力なレアは許容した ([Mechanics of Magic](https://mechanicsofmagic.com/2022/05/22/critical-play-is-this-game-balanced-10/))。Compile の「裏向き＝値2」は、効果のない基準値として機能している。表向きの各カードの「数値＋効果」がこの基準に対して得か損かを換算表にすると、バランス調整が楽になる（推論）。

---

## プレイテストは紙→観察→シミュレーション→ブラインドの順で回す

最初のプロトタイプは手書きの使い捨てでよい。遊べるものを作ると、「50枚の未定義カードがある」といったごまかしが効かなくなり、システムを実際に設計せざるを得なくなる ([Creating Games](https://creatinggames.press.plymouth.edu/?p=107))。紙なら数値を変えて再プレイするサイクルを、同じ午後のうちに何度も回せる ([Wayline](https://www.wayline.io/blog/paper-prototyping-for-game-developers))。テストは、自分だけで回す社内テスト、身近な人とのローカルテスト、ルールブックだけで遊んでもらうブラインドテストの3段階で進めるのが定番である ([BackerKit](https://www.backerkit.com/blog/tabletop-games-crowdfunding-roadmap/playtest/the-3-stages-of-playtesting-internal-local-and-blind/))。Jamey Stegmaier は、ブラインドテストで出たルールの質問は、答えがルールに書いてあっても全部重要だとする ([Stonemaier](https://stonemaiergames.com/?p=26253))。また、上手な10人のフィードバックは下手な100人より価値がある、同じ戦略ばかり使うテスターには別の戦略を試すよう頼む、とも述べている ([Stonemaier](https://stonemaiergames.com/?p=11002))。Scythe は Kickstarter の時点で**750回以上のマルチプレイのブラインドテスト**を経ていた ([Wikipedia](https://en.wikipedia.org/wiki/Scythe_(board_game)))。質問は、答えを誘導する形を避け、「その時何を考えていましたか？」のような自由回答式で聞く ([Schell Games](https://schellgames.com/blog/the-definitive-guide-to-playtest-questions-for-video-game-playtesters))。友人は気をつかって褒めがちなので、感想より行動を記録するのが有効である（推論）。行動とは、身を乗り出す、声が出る、自分の番以外にスマホを見る、「もう1回」と自分から言う、などだ。

数値の検証には AI シミュレーションが強力だが、役割は限られる。実際のボードゲームの改訂を AI エージェントで追った研究は、**AI テストは人間のテストを補完できるが置き換えられず、設計変更の大半は人間のテストがきっかけだった**と結論している。AI と人間の結果が一致すると、デザイナーは自信を持って速く変更できた ([UniversityXP 要約: Goodman et al. 2023](https://www.universityxp.com/research/2025/7/3/a-case-study-in-ai-assisted-board-game-design))。Jaffe らの Restricted Play は、バランスを「制約をかけたエージェントの勝率」で測る手法である。ある行動を禁じたエージェントの勝率が大きく落ちれば、その行動は強すぎると分かる。この研究では、実力が拮抗したチェスでの白の勝率が54〜56%であることを引き、**目的は小さな偏りの除去ではなく極端な違反の検出**だとしている ([AAAI PDF](https://cdn.aaai.org/ojs/12513/12513-52-16035-1-2-20201228.pdf))。ゲームの質を測る指標としては、首位交代、ドラマ（劣勢側が逆転できる見込み）、決定的な一手、分岐数などがある。Risk の研究では、正規化した目標値をいずれも0.5に置いた。首位交代が少なすぎれば退屈、多すぎればカオスになるからだ ([Rossato et al.](https://arxiv.org/pdf/2310.20008))。Browne の調査では、好まれたゲームは妥当な手数で終わり、最終勝者の不確実性が高かった ([The Engineer](https://theengineer.co.uk/content/news/good-game))。一方で、指標を最適化させると、指標上は良いのにほぼ自明なゲームが生成されるという限界も報告されている ([Rossato et al.](https://arxiv.org/pdf/2310.20008))。

4人戦のシミュレーションでは、多人数用の探索方針を使い分ける。各自が自分の得点を最大化すると仮定する Max-n 方針の MCTS は、完全情報の4ゲームでの比較で総合的に最良だった ([ICGA Journal](https://content.iospress.com/articles/icga-journal/icg36102))。他の全員が自分を潰しに来ると仮定する Paranoid 型や、リーダー叩き型のボットを卓に混ぜれば、ゲームが叩き合いに依存しているかを調べられる（推論）。サンプル数の目安も計算できる。二項分布で計算すると、4人戦の席別勝率（公平値25%）を±2ポイントの精度で測るには**各席あたり約1,800試合**が必要になる（推論による試算）。人間のテストで席順の偏りを見つけることはほぼ不可能だ。キングメイキングは、Wiersma の3条件をコード化すれば検出できる（推論）。ほぼ確実に負けているプレイヤーについて、手ごとに残り3人の勝率分布が大きく動き、かつ本人の勝率がどの手でも変わらない局面を数えればよい。

| 段階 | やること | 主な道具・指標 |
|---|---|---|
| 1. 問い | 核となる体験と、今回のテストで確かめる問いを1行で書く | 「このコアループだけで5ターン楽しいか？」 |
| 2. 紙の最小ゲーム | 手書きで作り、ソロで全員分を動かして最後まで回るまで直す | 壊れる前提で進める |
| 3. データ化 | カードを CSV/JSON の単一の情報源にし、印刷用とシミュレーター用の両方を生成する | ランダムボットで無限ループや終わらない試合を検出 |
| 4. コストカーブ | 共通の通貨で値付けし、外れ値に印をつける | 迷ったら弱めに |
| 5. ローカルテスト | デザイナーは観察に徹し、毎回同じアンケートを使う | 自由回答式の質問、行動の記録 |
| 6. 改訂 | 最大の問題を1つ選び、まず「削る」案を検討する。メモは1日寝かせる | 1回に変えるのは1〜2か所 ([Quirkworthy](https://quirkworthy.com/2026/03/20/how-to-fix-a-design-that-isnt-working/)) |
| 7. シミュレーション | 席別勝率、勢力の相性表、制約付きエージェントによる支配戦略の検出、首位交代、ドラマ、カード別の採用率と勝率 | 4人戦は席を回転させ、Max-n、Paranoid、リーダー叩き型のボットを混ぜる |
| 8. 照合 | 人間と AI の結果が一致すれば速く変更し、食い違えば人間側を優先して原因を調べる | — |
| 9. ブラインドテスト | ルールブックだけで遊んでもらい、出た質問はすべてルールの修正点として扱う | コンポーネントの意味を説明してもらい、理解のずれを探す |

---

## Compile × Smash Up の4人版：両作の長所を残し、4人戦の弱点を塞ぐ設計案

ここまでの知見をユーザーのゲームに当てはめた具体案を示す。**この節はすべて推論による提案**であり、プレイテストで検証すべき仮説として扱ってほしい。

核は、Compile の「**表＝効果／裏＝固定値**」の二択と、Smash Up の「**共有の基地での多数決**」の融合である。プレイヤーは2勢力をシャッフルしたデッキを使う（Smash Up 型）。ゲーム開始時の勢力選びは、4人ならスネーク順（1-2-3-4-4-3-2-1）のドラフトにすると、Compile のプロトコルドラフトの楽しさを残しつつ席順の不公平を和らげられる。場には4人なら5つ程度の共有の基地を置く（Smash Up の4人戦は5基地）。各プレイヤーは基地にカードを表向き（自分の勢力の効果が発動する）か裏向き（値2、効果なし。どこにでも出せる）で置く。基地の合計がブレイクポイントに達したら「コンパイル」が起き、順位に応じて得点したうえで、その基地のカードが全部消える。Compile のリセットは「負けそうな局地戦への過剰投資を避ける」判断を生み、Smash Up の基地得点は「誰を殴るか」ではなく「どこに置くか」の競争を生む。この二つは自然に噛み合う。

4人戦の弱点に対しては、次の手当てが考えられる。第一に、Smash Up で批判された「**4位が無得点**」を解消するため、順位点を4位まで配る（例：5／3／2／1）。これは Wiersma の条件2（どの手でも自分の順位が変わらない）を崩し、最下位にも参加理由を残す。第二に、カードの対象指定は「この基地の他のカード」「各対戦相手」を基本にする。「対戦相手1人を選ぶ」効果は少数に抑え、使う場合は「最も得点が高いプレイヤー」のように自動で対象が決まる形にする。第三に、ダウンタイム対策として、**全員が同時に伏せて配置し、優先権の順に一斉公開して解決する**Snap 型の手番を採る。優先権の持ち主は画面上で常に表示する。第四に、得点は「おおよそ分かるが正確には分からない」程度にする。たとえば勢力ごとの秘密の終了時ボーナス（Jaffe の Gates）を入れ、リーダー叩きとサンドバッギングを同時に抑える。第五に、慣性として**ラウンド上限**（例：最大8ラウンド）と残りラウンド数の常時表示を入れ、可変長の不安を消す。終盤の基地ほどブレイクポイントと得点を高くすると、Clash Royale 型の上昇する緊張曲線が作れる。第六に、別モードとして**2対2のチーム戦**を用意する。得点は共有し、手札は非公開にする。味方への合図は限られた手段だけに絞る。これでキングメイキングは構造的に消える。

両作への批判も先回りして潰しておく。Compile の「プロトコル概要が分からない」問題には、勢力ごとに「得意なこと／苦手なこと／勝ち方」の3行の参照カードを用意する。デジタル版なら勢力選択画面に表示する。Smash Up の「計算地獄」問題には、Web 版で基地ごとのパワー合計と順位を常時表示し、得点を自動計算する。カードテキストは「8語ルール」を意識して日本語20〜30字程度に収め、キーワードとアイコン、長押しでの詳細表示を組み合わせる。フィールバッド効果（相手のカードの破壊・無効化）は、「手札に戻す」「次のラウンドまで裏向きにする」などの遅延型にする。勢力設計では、各勢力に中心となる動詞を1つ（増やす、動かす、引く、裏返す など）と意図的な弱点を1つ決める。特定の勢力名を参照するカードは避け、組み合わせのシナジーは動詞同士の掛け算から生まれるようにする。Madness 型の「共通の負の資源を一部の勢力だけが欲しがる」仕掛けは、少ない追加ルールで勢力差を出す手段として有望である。

---

## 設計チェックリスト

| 領域 | 確認する問い | 合格の目安（出典がないものは自作の基準） |
|---|---|---|
| 体験の狙い | 狙う感情を2〜3個に絞って言語化したか | MDA の8分類から選ぶ |
| 核の判断 | ゲームを1つの単純で面白い判断で説明できるか | Snap の賭け、Gwent のパス、Hanamikoji の分配に相当するもの |
| 決定の質 | 各手番に「何かを諦める」選択があるか。最善手が状況で変わるか | 「常に1番目を選ぶ」選択肢がない |
| 不確実性 | 入力ランダム性を主軸にし、出力ランダム性は山場に限っているか | 敗因が「引き」に偏らない |
| 雪だるま | 中盤の首位がそのまま勝つ割合は適正か | 首位交代とドラマが中間値（正規化して約0.5） |
| 終わり方 | 慣性（確実に終わる仕組み）と上限時間があるか | 4人で20〜30分、スマホでは上限を表示 |
| 消化試合 | 勝敗が事実上決まってから終了までが短いか | 全員に「勝敗が分かった時点」を聞く |
| 4人：攻撃対象 | 「誰でも1人を選んで殴る」効果が少ないか | 場所単位・全員・自動対象を基本にする |
| 4人：キングメイキング | Wiersma の3条件のどれかを崩しているか | 全順位に得点がある、または得点が部分的に非公開 |
| 4人：待ち時間 | 自分の番以外の時間に何をさせるか | 同時配置と一斉公開、またはリアクションの機会 |
| 4人：席順 | 席別勝率を測ったか | 各席約1,800試合のシミュレーションで25%±数ポイント |
| カード文面 | 1回の説明で通じるか。画面上の語数は少ないか | 日本語20〜30字、2回説明が要るカードは作り直す |
| 複雑さ予算 | 入門用カードは他の1枚より多くに影響しないか | NWO の目安 |
| 勢力 | 「できないこと」と勝ち方が勢力ごとに明文化されているか | 全組み合わせで弱点が重なりすぎない |
| フィールバッド | 相手に何もさせない効果がないか | 否定ではなく遅延、補填つき |
| バランス | コストカーブで外れ値を探し、迷ったら弱めにしたか | すべてのカードに居場所がある |
| 支配戦略 | 制約付きボットや上級テスターで「壊す」テストをしたか | 特定の勢力・戦略の勝率が突出しない |
| デジタル | 隠匿情報をサーバーで管理し、切断時の Bot 代行を通知するか | 30〜60秒の猶予、復帰で席を返す |
| 感情設計 | 負けの見せ方、山場の演出に配慮したか | 「Escaped!」型の言葉選び、得点時の演出 |
| テスト | ブラインドテストで出た全質問をルールに反映したか | 質問ゼロを目指す |

---

## 結論

今回の調査で最も重要な発見は、「面白さ」の大部分がカード1枚の強さではなく**構造**で決まるということだ。構造とは、得点の配り方、攻撃対象の書き方、手番の同期のさせ方、終わり方の4点である。Knizia の「最弱色の得点で勝敗を決める」ルール ([Wikipedia](https://en.wikipedia.org/wiki/Tigris_and_Euphrates)) から Smash Up の順位得点、Snap の同時公開と撤退まで、優れた作品は個々のカードを調整する前に、プレイヤーの感情を左右する骨格を設計している。4人対戦では、この骨格の選択がそのままキングメイキングとダウンタイムへの耐性になる。「全順位に得点」「場所単位の対象指定」「同時公開」の三つを最初から入れておけば、4人戦の典型的な失敗の多くは発生しない。

もう一つの示唆は、個人開発者にとって**AI シミュレーションと人間のテストの役割分担**が決定的に重要だということだ。席順の偏りや支配戦略のような数値の問題は、人間の数十回のテストでは統計的に見えないが、シミュレーションなら一晩で検出できる。逆に、楽しさ、フィールバッド、ルールの分かりにくさは人間にしか測れない。したがって最適な開発ループは、カードデータを単一の情報源にして紙版・Web 版・シミュレーターを同時に生成し、数値の問題は機械で、体験の問題は友人の行動観察で潰すことである。ただし、キングメイキングを自動検出する手法、4人戦の首位交代の目標値、勢力別勝率の許容幅については確立した基準が見つかっていない。これらはデザイナー自身が基準を宣言し、版ごとに記録して育てていくべき領域である。
