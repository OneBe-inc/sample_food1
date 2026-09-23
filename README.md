# ワンビー食堂 — オムライス専門店のサンプル

承認済みのデザイン画像をもとにした、黄色とクリーム色の飲食店デモサイトです。PCでは細い中央カラムと左右の固定案内、スマートフォンでは1カラムと画面下の固定ボタンで表示します。

## 今回の仕様

- 店内写真を全面に広げたファーストビュー。コピー・ナビ・価格はHTMLで実装。
- オムライスのキャラクターを使った約1.1秒のローディングと、サイト内のキャラクターが左右に揺れる動き。端末の「動きを減らす」設定では省略。
- メニュー詳細、スマートフォンメニュー、お知らせ、予約内容のプレビューに対応。
- 「Web制作を相談する」が追従表示され、OneBeの指定LINE（https://lin.ee/pGcDjdz）を別タブで開きます。PCは右端の縦型、スマートフォンは予約バーの上に表示します。
- OGPはユーザー指定のPNGを無加工で使用。SHA-256による同一性検証を実装。
- トップと404に `noindex,nofollow`。検索公開を目的としないデモです。
- GA4はユーザーの取り消し指示により未導入。解析タグ・計測ID・解析用コードはありません。
- 予約は画面内の操作サンプルで、送信・保存しません。実在の店舗、住所、電話番号、SNSを仮造しません。

## 実行

公開対象は `dist/` の静的HTML・CSS・JavaScriptです。サイト自体のビルドは不要です。検証はNode.js 22以上を使用します。

```sh
npm ci
npm run check
npm run preview
```

プレビュー: http://127.0.0.1:4317/sample_food1/

別ターミナルで、プレビュー起動後に実行:

```sh
npm run check:aio:http
npm run audit:assets
node tools/audit-source.mjs
```

HTTP検証の対象を明示する場合: `node tools/check-http.mjs https://onebe-inc.github.io/sample_food1/`。公開前のURLには旧版が残るため、新版の検証は公開後に実施してください。

## GitHub Pages

既存の公開先設定は https://onebe-inc.github.io/sample_food1/ です。PRでは静的検証のみ実行し、mainへの反映後に既存のPagesワークフローが `dist/` を公開します。

この変更をPRで提出する段階では、新デザインの本番配信、公開URLの応答、SNSのOGPキャッシュ更新は未確認です。公開時はHTTP検証と実機表示を再確認してください。

GitHub Pagesのプロジェクトサイトでは、このリポジトリからドメインルートのrobots.txtや任意のHTTPヘッダーを管理できません。検索除外は各HTMLのrobotsメタで指定しています。robotsによるクロール拒否は追加せず、noindexを読める構成です。サイトマップにはnoindexページを入れていません。

## 記録

- [素材の出所と再利用方法](ASSETS.md)
- [ルール適用・検証マトリクス・例外](provenance/implementation-review-20260924.md)
- [ページ台帳](provenance/page-register.json)
- [画像台帳](provenance/asset-manifest.json)
- [生成プロンプト](provenance/restaurant-image-generation.json)
- [静的検証](provenance/verification/static.json) / [HTTP検証](provenance/verification/http.json)

`assets-source/ai-20260916/` と2026-09-16付の記録は旧サロン版の履歴資料です。Pagesの公開対象には含まれません。今回の素材・検証とは区別してください。
