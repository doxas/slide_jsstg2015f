#### はじめに

名前：杉本 雅広（すぎもと まさひろ）

運営中： <a href="http://wgld.org/" target="_blank">wgld.org</a>, <a href="http://webgl.souhonzan.org/" target="_blank">WebGL 総本山</a>

![doxas](doxas.png)

---

#### はじめに

まずは、jsstg へ作品を出展してくださった方々、そして連動企画となる本勉強会にご参加くださった方々、ありがとうございます。
jsstg 2015 は第二回にあたりますが、今後また第三回も開催できればいいなと思っています。
--今後とも jsstg をよろしくお願いします！--

---

#### 本日のテーマ

**マルチプラットフォーム WebGL**

jsstg 2015 に出展した「torna-do」の実装を紐解きつつ、モバイル端末でも動作可能な WebGL コンテンツの作成について考えていきます。
モバイル端末ならではのセンサーを使った実装や、いかに描画の負荷を抑えつつリッチな表現を行うかなど、お話できればと思っています。

---

#### agenda

* マルチプラットフォームな入力対応
* モバイル端末サポートの難点
* 負荷を程よく抑えるためのポイント
* リッチな表現を行うためのポイント

---

#### jsstg 出展作 torna-do

<a href="http://game.wgld.org/torna-do/" target="_blank">torna-do</a>

---

#### jsstg 出展作 torna-do

jsstg 2015 に出展した、果たしてこれはシューティングゲームと呼べるのかという疑惑のある一作。

![torna-do](torna_do.jpg)

---

#### 最初に思い描いていたコンセプト

* モバイル端末でも動作するようにしたい
* モバイル端末ならではのセンサーを利用したい
* 負荷を少しでも抑えるため頂点数は少なくしたい
* でも見た目はちょっとくらいかっこよくしたい

---

#### 最初に思い描いていたコンセプト

* モバイル端末でも動作するようにしたい
* モバイル端末ならではのセンサーを利用したい
* 負荷を少しでも抑えるため頂点数は少なくしたい
* でも見た目はちょっとくらいかっこよくしたい
--下のふたつは相反する部分があるので悩ましいところ--

---

#### モバイルならではのセンサー

---

#### モバイルならではのセンサー

一番最初の段階から考えていたこととして、PC には無い、モバイル端末ならではの*センサーを使った実装*をやってみたかった。
真っ先に思いついたのが「タッチ」と「ジャイロ」のふたつ。
タッチを使うならマルチタッチ対応にしたかったが、*なんとなくジャイロのほうが面白そう*だったのでジャイロセンサーを採用することに。

---

#### ジャイロセンサーとは

ジャイロセンサーは、モバイル端末の「傾き」を計測するセンサーです。
javascript から参照できるセンサーとしては、最も初期から対応が進められてきたものなので、Android や iOS で比較的データを取れる可能性が高く使いやすいセンサーだと思います。
ちなみに、どのセンサーの情報が取れるのかは OS とブラウザの実装によります。
--たとえば Android でしか取れないセンサーもあります。--

---

#### ジャイロセンサーの入力を取得

ジャイロセンサーの値は、端末の傾きを X Y Z の三軸で取った結果として取得できます。
正式な表記が X Y Z ではなく alpha、beta、gamma なのでちょっと紛らわしいです。
--X = beta, Y = gamma, Z = alpha--

---

#### ジャイロセンサーの入力を取得

![device orientation](orientation.jpg)

---

#### ゲームにどう組み込んだか

---

#### ゲームにどう組み込んだか

torna-do の場合は、alpha（z）の情報は利用せずに、beta（x）と gamma（y）の情報だけを自機キャラクターの移動に利用してます。
動作環境が PC の場合は、キー入力により移動しますが一度のキー入力に対して一定の慣性が付くようにしました。
キー入力で慣性が付くようにしたのには理由があり、モバイル端末での実行時に比べ*キー入力のほうが圧倒的に操作しやすい*ことが予想できたので、PC 側では少し難易度を上げたかったためこのような方式にしました。

---

#### マルチプラットフォームな移動処理実装

キャラクターの移動処理は、モバイル端末では、端末の傾きに応じて「キャラクターに適用される慣性ベクトルを増減させる」方針にしました。
素直にセンサーの値を移動距離にそのまま適用してしまうと、移動が速くなりすぎたり、ブレが大きく制御しにくいと感じる傾向があったためにこのような方針にしました。
--「慣性ベクトル」という数学の概念があるわけじゃないです！--

---

#### マルチプラットフォームな移動処理実装

まとめると、PC ならキーの入力を、モバイル端末ならジャイロセンサーの情報を、*慣性ベクトル*に適用します。
慣性ベクトルは、自機キャラクターの「移動する方向」や、「移動する量」の指標となるベクトルです。
この慣性ベクトルが、たとえば`(1.0, 1.0)`の状態であれば自機キャラクターは右上に向かって進んでいきます。`(0.0, 0.0)`になると停止している状態になります。

---

#### 慣性ベクトルの減衰

移動量や移動する方向を管理するための慣性ベクトルは、ループのたびに`0.95`を乗算する仕組みになっています。これによって自然な減衰のような効果が得られます。

```
初期値が(1.0, 1.0)だとすると……
1回目 (1.0, 1.0) * 0.95 = (0.95, 0.95)
2回目 (0.95, 0.95) * 0.95 = (0.9025, 0.9025)
3回目 (0.9025, 0.9025) * 0.95 = (0.8573..., 0.8573...)
```

---

#### 慣性ベクトルの減衰

非常に簡単な乗算処理を毎ループ行うだけで、まるで水中を漂っているかのようなふわふわとした動きが実現できます。
計算の負荷も高くありませんし、手軽に使えるのでおすすめです。

---

#### モバイル端末を動作環境に含める場合の難点

---

#### モバイル端末を動作環境に含める場合の難点

モバイル端末での動作を踏まえた場合に、難点になりそうな部分がいくつかあったので紹介します。

---

#### モバイル端末を動作環境に含める場合の難点

モバイル端末での動作を踏まえた場合に、難点になりそうな部分がいくつかあったので紹介します。
* イベントの発火回数問題
* スクリーンの大きさや画面ロックの問題
* リソースのダウンロード問題

---

#### イベントの発火回数問題

ジャイロセンサーを用いる場合、`deviceorientation`という名前のイベントに`addEventListener`で関数を登録します。
実際にやってみるとわかりますが、ジャイロセンサーは非常に精度が高く更新頻度も多いです。
ほとんど振動の無い部屋で、テーブルの上に置いて放置するくらいのことをしないと、常にイベントが発火し続けます（機種によるのかもしれませんが）。

---

#### イベントの発火回数問題

このことから、描画に関連するイベントを`addEventListener`と紐付けたり、コストの高い計算をイベント発火のたびに行ったりすると、*非常に大きな負荷*になる可能性があります。
やり方はいろいろ考えられますが、適当にイベントを間引くような仕組みを入れたり、イベント発火によって実行される処理の内容をよく吟味する必要があると思います。

---

#### イベントの発火回数問題

たとえば、イベント発火のたびに「数値を加算」するような処理を仕込んでいると、ループが回るよりも高い頻度でイベントが発火してしまった際に、想定していたよりも加算処理が多く発生してしまう可能性がありますよね。
ループの動きと連動したフラグを使って、フラグが既に立っていたらイベント発火時の処理を場合により`return`するなど、なにかしらの工夫が必要な場面も考えられるのかなと思いました。

---

#### スクリーンの大きさやロックの問題

現在策定中の <a href="http://www.w3.org/TR/screen-orientation/" target="_blank">Screen Orientation API</a> を利用すると、画面の向きをロックすることができ、縦長や横長の画面に最適化された設計ができるようになります。
現状は、かなりブラウザにより混沌としている感じなので、torna-do には画面のロック機能は入れていません。
傾き具合を移動のパラメータとして利用している本作では、本来であればロック機能はぜひとも欲しかったんですが残念。

---

#### スクリーンの大きさやロックの問題

また、スクリーンが横長でも縦長でも対応できるように設計が可能なのであれば話は別ですが、torna-do の場合、縦長や横長になると敵キャラクターが出現した瞬間の、自機キャラクターとの距離に差が生じてしまいます。
torna-do では、苦肉の策として canvas のサイズを正方形に強制してしまうようにしました。画面のロックが javascript から制御できるようになれば、もっといろいろな発想が行えるようになっていくと思いますので、今後に期待という感じ。
--VR コンテンツを作るのにも必ず必要ですよね。--

---

#### リソース毎回ダウンロードはつらいよ問題

モバイル端末で結構根深い問題だなと感じるのが、リソースのダウンロードに掛かる時間。
torna-do では 4.5MB ほどの容量を持つ BGM 用の mp3 ファイルを使っていますが、有線で接続している PC と比較すると時間的にも、また通信容量制限の兼ね合いからも、やっぱりつらいなあという印象。
このあたりも、インフラや通信事業者の今後に期待するしかなさそう。

---

#### プロシージャルにできるものを見極める

ページを開くたびにダウンロードが発生してしまうことを避ける意味では、可能な範囲で、プロシージャルに生成できるものはプロシージャルに、という考え方もあります。
プロシージャルにやってしまうことで逆に高負荷になったり、時間が掛かってしまうものも考えられるので、そのあたりはうまく調整することが必要になります。

---

#### プロシージャルにできるものを見極める

プロシージャルに生成できるものといえば、代表的なところでは以下のようなもの。

* ノイズテクスチャ（WebGLでやると速い）
* キャプションなどの文字列（canvas2D）
* 効果音や BGM（Web Audio API や Web MIDI API）
* モデルのメッシュデータ（幾何学的なものなら）

---

#### リッチな表現の工夫

---

#### リッチな表現の工夫

見た目をリッチにするためには、やり方はいろいろ考えられるものの、王道的なものがいくつかあります。
ゲームやコンテンツの雰囲気にもよるので一概には言えませんが、紹介します。
モバイル端末での動作を保証するなら、とにかくリッチな表現をモリモリ入れていけばいいというわけにもいかないので、実際に使えるものをチョイスする必要がある点に注意です。

---

#### リッチな表現の工夫

* 光を上手に表現する
* 低いコストでそれっぽく動きをつける
* 動きに音を連動させる

---

#### 光を上手に表現する

全体に暗いイメージのシーンでは特に有用な方法として、光のあふれ表現をうまく行うことが挙げられます。

![加算合成で光表現](addeffect.png)

---

#### 光とブラーと加算合成と

光の表現に欠かせない大きな要因として、*ブラー*と*加算合成*のふたつがあります。
ブラーとは「ぼかし」のことですね。ガウシアンブラーなどが有名です。
加算合成とは、色を乗算によって処理するのではなく、加算によって合成処理する方法です。これらを組み合わせることによって、いかにも発光しているかのような、光のあふれがシーンに乗ります。

---

#### 光とブラーと加算合成と

乗算と加算の色の合成方法の違い。

![色の合成方法の違い](filtermode.png)

---

#### シェーダとブレンドファクタ

WebGL ではシェーダを用いて色を自在に処理することができますが、ブレンドに関する設定は javascript 側で行います。
ブレンドファクタの設定をシェーダ側で調整することはできないので、描画命令を発行する前に javascript で設定を行っておかないといけないわけです。
torna-do の場合、ブレンドファクタの設定で「加算合成とアルファ値による半透明処理」を同時に行えるように設定しています。

---

#### シェーダとブレンドファクタ

フェードインやフェードアウトの効果を持たせるために、透明度はリアルタイムに調整できないといけません。
そこでアルファ値に関してはシェーダ側で処理するような実装になっています。
時間の経過とともにアルファ値を調整することで、徐々にフェードアウトするような表現が行えます。torna-do では、爆発エフェクトのフェードアウトや、ゲームオーバー時のブラックアウトなどに使っています。

---

#### ポストエフェクトで光のあふれを表現

torna-do では、一度オフスクリーンでシーン中のモデルを直線のラインや点描によって描画します。
次にそのオフスクリーンのシーン全体を、ガウシアンブラーでぼかします。
あとは、ぼかしたシーンを最終的なシーンに加算合成で重ねてやれば、光のあふれのような表現を動的に行うことができるわけですね。

---

#### 低い計算コストで動かす

単純な話として、モバイル端末は PC に比べてスペック的には劣る形になることが大半です。CPU 的にも GPU 的にも、極力負荷を抑えたいわけです。
先ほど出てきた`0.95`倍して徐々に減衰する様子を再現するなど「それっぽく見えればいい」という考え方は結構大事です。
たとえば torna-do では、自機キャラクターを追尾するタイプの敵キャラクターがいます。
--いわゆるホーミングの計算、どうやる？--

---

#### 低い計算コストで動かす

実直にやるなら、敵の位置と自機の位置からベクトルを算出してそれと敵の進行方向ベクトルで云々して云々して云々して……

---

#### 低い計算コストで動かす

実直にやるなら、敵の位置と自機の位置からベクトルを算出してそれと敵の進行方向ベクトルで云々して云々して云々して……
ということになるので、今回はハーフベクトルを使って簡単にホーミング軌道の計算を行えるようにしています。
ハーフベクトルを用いる場合は、ベクトルとベクトルを加算して正規化するだけです。言葉で説明するのも簡単ですし、実装するのも簡単です。

---

#### 低い計算コストで動かす

ハーフベクトルの話はあくまでも一例ですが、多少厳密でなくても、簡単に扱える概念で代用できるものは積極採用するのが吉です。
たとえば乱数をあらかじめハッシュにしておくとか、ラジアンやサイン、コサインはあらかじめ長さ 360 の配列にそれぞれ突っ込むとか、そういう地味な取り組みでも積もっていくといろいろ変わってきます。
ちょっと難しい話になっちゃいますが、行列をバリバリ使うよりもクォータニオン使って計算コスト抑える、とかもいいかもしれません。

---

#### 低い計算コストで動かす

将来的には、WebGL に transform feedback と呼ばれる機構が導入される予定になっています。
これを利用すればシェーダの計算結果を VBO に書き戻すことができるようになるため、javascript で行っていた処理のいくつかを GPU 側に負担してもらうことができるようになります。
--ただ、モバイルにこれがくるのはいつなのか……--

---

#### 動きに音を連動させる

ゲームの場合は特に、音は見た目と同じくらいリッチさに影響します。まったく同じ絵面でも、音があるだけで派手に感じたりします。
シューティングゲームは特に、爆発や破壊といった表現が多く登場するので、音はとっても大事ですね。

---

#### 動きに音を連動させる

javascript では Audio エレメントを用いる方法もありますが、ぜひ Web Audio API を使いましょう。
Web Audio API であれば音を重ね合わせることもでき、より精細な音の表現ができます。
また少ないリソースを、Web Audio API でエフェクト処理することで、あたかも別の音源であるかのように聞かせることもできます。

---

#### 動きに音を連動させる

torna-do では使っていませんが、Web Audio API を用いれば*音源の解析*もできます。
再生される音に応じて描画結果を変化させたり、モデルを動かしたりすることで、よりリッチな表現を行うことができるでしょう。

---

#### ポイントまとめ

**マルチプラットフォームな入力**

---

#### ポイントまとめ

**マルチプラットフォームな入力**
ジャイロセンサーを用いる場合は、alpha や beta といった、X Y Z とは異なる名前になっている点に注意。
また、すごく更新頻度が高いので、イベントハンドラに連動させる処理の内容にも一工夫を。

---

#### ポイントまとめ

**低い計算コストを採用する工夫**

---

#### ポイントまとめ

**低い計算コストを採用する工夫**

どこまでやるのかは正直判断が難しいが、出来る限り低コストな計算で処理を行うようにする。
場合によってはシェーダ側でやってもらうようにすれば、CPU の負担を減らし GPU で高速に処理することもできる。

---

#### ポイントまとめ

**リッチな表現をモバイルでも使う**

---
#### ポイントまとめ

**リッチな表現をモバイルでも使う**

光の表現やサウンドを効果的に使った演出を行う。
現状既にモバイル端末でも WebGL のオフスクリーンレンダリングや Web Audio API は利用できるので、これらを活用する。

---

#### おわりに

何か参考になることはあったでしょうか。
モバイル端末における WebGL 実装はかなり現実的なレベルになってきているので、いろいろ遊んでみると面白いと思います。
モバイル端末を使った VR も流行の兆しがあります。ぜひみなさんもチャレンジしてみてください！

---

#### おわりに

ありがとうございました！

---

