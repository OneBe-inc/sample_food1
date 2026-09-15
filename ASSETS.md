# 写真・書体・コードの出所（AI画像版）

更新日: 2026-09-16

## 現行の公開写真

全4点を、本案件用にbuilt-in `image_gen__imagegen` で新規生成。参照画像・WebサイトのURL・既存写真は画像生成に入力していません。モデルの学習内容は確認できません。

| 公開JPEG | 生成原本 | 用途 |
| --- | --- | --- |
| dist/assets/ai-hero-salon.jpg | assets-source/ai-20260916/hero-salon.png | 架空サロンの内装 |
| dist/assets/ai-care-styling.jpg | assets-source/ai-20260916/care-styling.png | 架空のヘアケアの手元 |
| dist/assets/ai-botanical.jpg | assets-source/ai-20260916/botanical.png | 植物の静物・記事画像 |
| dist/assets/ai-lounge.jpg | assets-source/ai-20260916/lounge.png | 架空の待合空間 |

PNG原本は無加工で保管。公開JPEGは元寸法のまま品質88で形式変換し、内容の合成・修正はしていません。画面ではCSSでトリミング・明暗調整があります。

生成プロンプト: provenance/prompts-and-metadata.json
原本と公開用ファイルのSHA-256: provenance/asset-manifest.json

## 旧素材

初版4点はPexelsのストック写真で、参照元レストランの写真ではありませんでした。今回すべてdistから除外し、参照も更新しました。旧コミット履歴と非公開のローカル確認フォルダには旧写真が残ります。既存Git履歴の削除・書き換えはしていません。Pagesはdistのみ配信します。

## 文字・UI・書体

屋号「サンプル」とコピーライト「© SAMPLE — DEMONSTRATION WEBSITE」を維持。本文・ロゴの文字組み・favicon・HTML・CSS・JavaScriptは本案件で作成し、参照元の文章・ロゴ・装飾・コードは移植していません。

外部書体はGoogle FontsのDM Sans、Noto Serif JP、Noto Sans JP。これらは第三者由来のライセンス素材として、AI画像・独自コードとは区別します。

確認内容と限界: provenance/copyright-review.md
