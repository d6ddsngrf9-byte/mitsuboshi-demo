# 引き継ぎ（現状トップ）みつぼしART星田 クラファンLP — 2026-07-09

※これは「今の続き」用の最新メモ。制作全体の背景・詳細は `HANDOVER_みつぼしART星田_クラファンLP.md` を参照（そちらのフッター問題は解決済み・下記に現状を反映）。
新セッションはまず MEMORY.md（自動ロード）を読む。特に [[mitsuboshi-demo-project]] [[feedback-design-corrections]] [[feedback-jp-typography]] [[feedback-2mac-workflow]] [[claude-memory-sync]]。

## クイックスタート
- 本体: `~/mitsuboshi-demo/index.html`（単一HTML・ロゴbase64埋め込み・日英i18n）。画像は `images/`（作家＋`images/shops/`）。
- git: private `github.com/d6ddsngrf9-byte/mitsuboshi-demo`（main）。**編集後は即デプロイ**（確認取らない）:
  `git add -A && git commit -m "…" && git push && vercel --prod --yes`
- 本番: https://mitsuboshi-demo.vercel.app （確認は `?数字` 付きURL か再読込。Cache-Control設定済みで再検証される）。
- 現状: 作業ツリー クリーン、local=remote=本番=`7fc7df2`。

## ★未完了・次にやること（ユーザー指示・最優先）
1. **ゲージの星がPCとスマホで違う→揃える。** 原因は進捗バーのマーカーが**文字グリフ `✦`（U+2726）で端末により描画が変わる**こと。対策は **`✦`→インラインSVGの4点スターに置換**（端末非依存で同一形状に）。着手途中でrevert済み。手順:
   - マークアップ `<span class="marker" id="marker">✦</span>`（ヒーローの `.track` 内）を SVG入りに。
   - `.marker` CSS: `font-size`/`color`/`calc(-50% - 3.2px)` をやめ `transform:translate(-50%,-50%)` ＋ `.marker svg{display:block;fill:var(--gold);}`。JS(`marker.style.left=pct%`)はそのまま動く。SVGサイズは~26pxで実機に合わせ微調整。
2. **その他 PC/SP のおかしな差を点検して直す**（※改行など個別指摘済みのものは除く）。`✦`グリフは他所（eyebrow前・三つの星・note-pill・trust等）でも使用→端末差が気になれば同様にSVG化を検討。PC/スマホ両幅で流し見して不自然な差を潰す。

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
