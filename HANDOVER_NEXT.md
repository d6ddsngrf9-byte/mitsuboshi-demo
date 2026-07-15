# 2026-07-15 Stripe決済(テストモード)組み込み — 残タスクは前田さん作業
コードは実装・デプロイ済み。**ユーザー本人がStripe/Vercelダッシュボードで行う必要がある残タスク**（APIキー等の機密情報はClaudeが代理入力しない方針のため）:
1. **Vercelに環境変数を設定**: プロジェクト設定 → Environment Variables に `STRIPE_SECRET_KEY`（Stripeテストモードのシークレットキー sk_test_...）を追加。追加後は再デプロイが必要（`vercel deploy --prod --yes`）。
2. **Webhookエンドポイント登録**: Stripeダッシュボード → 開発者 → Webhook → エンドポイント追加 `https://atelier-shiroito.art/api/webhook`、イベントは `checkout.session.completed`。作成後に表示される signing secret (`whsec_...`) を Vercel環境変数 `STRIPE_WEBHOOK_SECRET` に設定。
3. **（任意）コンビニ決済・銀行振込を有効化**: Stripeダッシュボード → 設定 → 支払い方法 で「コンビニ払い」「銀行振込（日本）」を有効化。コード側は `payment_method_types` を指定していないため、ここで有効にした分だけCheckoutに自動で表示される（コード変更不要）。
4. 上記が済んだらテストカード（4242 4242 4242 4242 等）で決済フローを一通り確認 → 問題なければ本番用シークレットキーに差し替えてライブ化。

**実装済みの内容**（このセッションで完了）:
- `api/create-checkout-session.js`: 9コース（`c1`〜`c11`、crowdfunding/index.htmlの `.course-body` と対応）の金額・名称をサーバー側で固定管理し、Stripe Checkout Sessionを作成するVercel Function。金額はクライアントから受け取らず、tierキーのみ受け取ってサーバー側の表で引く方式（改ざん防止）。
- `api/webhook.js`: `checkout.session.completed` を署名検証つきで受信するスケルトン。現状はログ出力のみ。**支援者数・集計金額のUI反映は未実装**（現状のゲージ0%/0円は静的な仮値のまま）。将来やるならデータストア（Vercel KV等）が必要。
- `crowdfunding/index.html`: 9つの「支援する」ボタンに `data-tier` を付与し、クリックで `/api/create-checkout-session` にPOST→返ってきた `url` へ遷移。失敗時は既存のtoast機構でエラーメッセージを表示しボタンを復帰。決済キャンセル時は `?canceled=1` で戻ってきてトースト表示。ヒーロー/フッターの「このプロジェクトを支援する」の2ボタンは今回のスコープ外で従来通り `data-demo`（トースト表示のみ、Stripeには繋がない）。
- `crowdfunding/thanks.html`: 決済完了後のサンクスページを新設（サイトのトーン・フォントに合わせたデザイン）。
- `package.json`/`package-lock.json`: `stripe` SDK追加。ローカルに `node_modules` は生成せずコミット（.gitignoreに追加済み）。

# 2026-07-13 更新
- **回遊マップカード**: 背景に実際のGoogleマップ埋め込み（星田駅 34.7675,135.6639 中心・z16・`output=embed`のキー不要方式）。iframeはCSSフィルターで青トーン化＋`.map-scrim`ラジアル＋`.map-inner`テキストシャドウ。**装飾用**（pointer-events:none・lazy・aria-hidden）なのでカード上のスクロール/CTAは従来通り。トーン調整はフィルターとスクリムのrgba値で（スクリム合計が濃すぎると地図が消える。中心.56/縁.33が現値）。
- **協力店グリッド**: 削除5（司法書士大侑/星田ネオ書房/甜甜/セカンドたなかや/飯田寝装店）・追加7（ShiroiTo SOCO/牧野さん家/BOさん(自転車修理)/チッタさん(カフェバー)/はなまる介護星田/ほっこりアットホーム/星田会館）。追加7件は**写真未手配→白タイル＋金星のテキストプレースホルダー**（`.shops-grid .ph`）。写真が届いたら `<div class="ph">…</div>` を `<img src="images/shops/xxx.jpg">` に差し替えるだけ。並びは五十音順。注記も「2026年版は確定し次第、順次更新」に変更（EN辞書も更新済み）。グリッドに `id="shopsgrid"` 追加。
- **OGP**: og:/twitter: メタタグ一式を`<head>`に追加。シェア画像 `crowdfunding/images/ogp.png`（1200×630, 89KB。A1明朝タグライン＋ロゴ＋会期＋主催。生成元は headless Chrome、ソースHTMLは scratchpad のため再生成時は要再作成）。og:url=https://atelier-shiroito.art/crowdfunding/。※`<title>`はまだ「（デモ）」付き・DEMOリボンも残存 → 公開直前に外す判断待ち。

# ⚠️ 2026-07-11 統合済み — まずここを読む

**7/9〜7/10にmini線とAir線がフォークし、本番を相互上書きしていた**（Air側がminiの7/9改善を知らずに7/8ベースで再構築→上書き）。7/11未明にAir側で両線を統合し、本ツリーが唯一の正。

## 統合後の状態（= 本番）
- **構成変更**: `crowdfunding/index.html` + `crowdfunding/images/`（独自ドメイン **atelier-shiroito.art** を本体サイトの正ドメインとし、クラファンは /crowdfunding/ 配下。本体完成までルート→/crowdfunding/ の307リダイレクト。vercel.json参照）
- mini線から継承: SVGゲージ星／reveal threshold:0+rootMargin修正／一人ひとり統一／応援団表記／フッター修正／_srcJA i18n／オカジマ・ヨシコ（7名）／br-sp
- Air線から統合: hero冒頭句削除（「障がいのある人もない人も、」除去）／助成段落の全面改稿（「この芸術祭の実現には…助成だけではまかないきれません」※前田さん事実確認済み）／支払い3文の補足／.muted→ink（本文段落を濃く）／revealへのIOガード＋noscript保険（rootMargin等はmini値を維持）／全画像を表示サイズ再圧縮＋プログレッシブJPEG（5.3→2.3MB）
- **運用ルール（フォーク再発防止）**: 作業開始前に必ず `git pull`。2台同時にCodeを走らせない。編集後は `git add -A && git commit && git push && vercel deploy --prod --yes`（deploy はリポジトリルートから）
- ✅解決(2026-07-11): ムームーのNSを ns1/ns2.vercel-dns.com に切替完了。`atelier-shiroito.art` は 307→/crowdfunding/→200、SSL(Let's Encrypt)自動発行済み。dig/Google DNS/openssl で確認済み。✅`www.atelier-shiroito.art` もVercelに追加済み・SSL発行済み(307→/crowdfunding/→200)。※現状 apex と www は各自で /crowdfunding/ に307＝別URL。SEO段階で www→apex 正規化 or canonical を入れる（軽微・保留）
- 注意: 「なぜやるのか」why-p1 はmini推敲版を採用（Airで前田さんが指定した版と微差あり。要ならAir版に差し替え）

---

# 引き継ぎ（現状トップ）みつぼしART星田 クラファンLP — 2026-07-09

※これは「今の続き」用の最新メモ。制作全体の背景・詳細は `HANDOVER_みつぼしART星田_クラファンLP.md` を参照（そちらのフッター問題は解決済み・下記に現状を反映）。
新セッションはまず MEMORY.md（自動ロード）を読む。特に [[mitsuboshi-demo-project]] [[feedback-design-corrections]] [[feedback-jp-typography]] [[feedback-2mac-workflow]] [[claude-memory-sync]]。

## クイックスタート
- 本体: `~/mitsuboshi-demo/index.html`（単一HTML・ロゴbase64埋め込み・日英i18n）。画像は `images/`（作家＋`images/shops/`）。
- git: private `github.com/d6ddsngrf9-byte/mitsuboshi-demo`（main）。**編集後は即デプロイ**（確認取らない）:
  `git add -A && git commit -m "…" && git push && vercel --prod --yes`
- 本番: https://mitsuboshi-demo.vercel.app （確認は `?数字` 付きURL か再読込。Cache-Control設定済みで再検証される）。
- 現状: 作業ツリー クリーン、local=remote=本番=`7fc7df2`。

## ✅ 完了（2026-07-09）
- **ゲージの星をSVG化＝PC/スマホで同一形状に。** マーカー `#marker` の `✦`（U+2726）→インラインSVGの4点スター（`viewBox 0 0 26 26`, 26px, `fill:var(--gold)`）。`.marker` CSSは `transform:translate(-50%,-50%)` ＋ `.marker svg{display:block;width/height:26px;}` に変更。JS(`marker.style.left=pct%`)はそのまま。形はMacの `✦` に近い"中間"の太さ（Qカーブ版）でユーザーOK確定。

## ★次にやること（優先度順）
1. **残りの `✦` グリフのSVG化（任意・保留中）。** ゲージ以外にも `✦` が残る＝同じく端末差が出る。ユーザーが気にすれば一括でSVG化（上のゲージと同じパスを流用可）。該当箇所:
   - CSS `content:"✦"`: `.eyebrow::before`(62)/`.note-pill::before`(143)/`.trust li::before`(171)/`.pay-trust p::before`(211)
   - 本文グリフ: `.star-glyph`「三つの星」カード×3(372-374)
   - ※course-thumb等のSVG内 `<text>✦` は既にSVGだが中身は文字グリフ→端末差の懸念あれば併せて置換。
2. **その他 PC/SP のおかしな差を点検して直す**（※改行など個別指摘済みのものは除く）。PC/スマホ両幅で流し見して不自然な差を潰す。

## 判断待ち→ほぼ解決済み（記録）
- 応援団(3k/5k/10k/30k)=順位づけない統一表現に（「大口」削除）済み。
- まちの協力者=現行(写真グリッド)のまま。
- 招待作家=7名（オカジマ・ヨシコ追加・写真反映済み）。
- 全体校正=主要分実施（表記ゆれは概ねクリーン。ひとりひとり→一人ひとり統一済み）。
- 旧課題のフッターPC表示ズレ=解決済み。

## このサイトの"地雷"（新セッションが踏まないよう）
- **i18n二重管理**: JA表示は**HTML本文のスナップショット**（`_srcJA`, applyLang）を使う＝**JAの文言/改行はHTML本文を直せばOK**。ENは `I18N` 辞書の `en` を直す。辞書の `ja` は基本dead。
- **`.br-sp`**: スマホのみ改行するクラス。`<br class="br-sp">` を使うと PC=無視/SP=改行。読みやすさの改行はコレで。
- **reveal**: IntersectionObserver `threshold:0,rootMargin:'0px 0px -10% 0px'`。**縦長セクションが出ない不具合の対策済み。ここは触らない**（`.15`等に戻すと再発）。
- フォント: 見出し/数字=Adobe Fonts「砧 丸明Katura StdN」(Typekit kitId `wia5qvv`)、本文=Zen Kaku Gothic New。
- taido.design表記は必ずドットあり。会期=2026/11/14(土)〜11/29(日)。金額/支援者数はサンプル。
- （任意懸念）`HANDOVER_*.md` はgit同梱でVercel公開パスにも載る。気になれば `.vercelignore`/gitignore を検討。

## ユーザー(前田さん=AD)の傾向 → [[feedback-design-corrections]]
スマホ最優先／改行(語中割れNG・句読点で改行)／センター・余白・1行化／ピクセル単位のアライメント(実測で合わせる)／一貫性(同じ処理は同じく)／トーン重視・支援者を順位づけしない／実データ置換／即デプロイ。修正はスクショ＋一言で来ることが多い。

## 検証のコツ / 既知のクセ
- プレビューは `preview_start`（launch.json の `mitsuboshi-demo`, port 8000）。**編集後リロード**して確認。
- `preview_screenshot` はスクロール位置がずれて別セクションが写ることがある→**`preview_eval`で `getBoundingClientRect` 等の実測**を併用すると確実。
- Bashの `(eval):character not in range` は日本語表示のzsh警告で**無害**（結果に影響なし）。
- 変更検証は「ローカルreload→eval実測→本番curlでgrep」。

## 2台運用（[[feedback-2mac-workflow]]）
mini(主)/Air(出先)。Codeは片方だけ・受け渡しはgit・commit/pushは原則mini。memoryはiCloud symlink＋gitで共有（[[claude-memory-sync]]）。
