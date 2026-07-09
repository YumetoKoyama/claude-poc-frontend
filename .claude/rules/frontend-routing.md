# フロントエンド ルーティングと認可制御ルール

## App Router の前提

- Next.js は App Router を使用する。Pages Router は使わない。
- ルーティング定義、レイアウト、エラーハンドリング、ローディング状態は Next.js の標準機能で扱う。
- `loading.tsx`、`error.tsx`、`layout.tsx` は route segment 単位で定義する。

## route group の構成

- 認証前画面は `(public)` グループに集約し、シンプルなレイアウトを適用する。
- 認証後画面は `(protected)` グループに集約し、共通ヘッダーを `layout.tsx` で自動適用する。
- 運送業者向け画面は `/carrier/*`、荷主向け画面は `/shipper/*` に分ける。
- ルート直下の `page.tsx` は、未ログイン時は `/login`、ログイン済み時はロールに応じて `/carrier/dashboard` または `/shipper/dashboard` へ遷移させる。
- `/forbidden` を用意し、認可エラー時の遷移先を統一する。

## page.tsx の責務

- `page.tsx` は画面エントリとして薄く保つ。
- `page.tsx` の中で直接 API 呼び出しと状態更新を行わない。
- 業務ロジック、状態変更、API 呼び出しは直接持たせず、features 配下へ寄せる。
- `page.tsx` は URL 単位の表示可否判定を行う。

## route.ts の責務

- Route Handler を利用する場合は `route.ts` を使用し、`route.tsx` は使わない。
- `app/api/auth/session/route.ts` では、現在のログインセッション情報を返す。
- Cookie の受け渡し、ヘッダ整形、フロント向けレスポンス整形をここで吸収する。
- Route Handler を多用してバックエンド API の単純中継を大量に作らない。認証、セッション確認、フロント固有のレスポンス整形が必要なものに限定する。

## 認可制御の 3 層構成

認可制御は以下の 3 層で分担する。混在させない。

1. **middleware.ts** - 未認証アクセスと明らかなロール不整合を入口で遮断する
2. **protected/layout.tsx** - 認証済みユーザー情報を読み込み、共通ヘッダーと権限情報を渡す
3. **page.tsx と feature 側** - 画面固有の表示制御と操作可否を判定する

## middleware.ts のルール

- Cookie などからログイン状態とロールを確認し、ルート単位で早期リダイレクトを行う。
- 未ログインで protected 配下へ来た場合は `/login` へリダイレクトする。
- carrier ロール以外が `/carrier/*` に来た場合は `/forbidden` へリダイレクトする。
- shipper ロール以外が `/shipper/*` に来た場合は `/forbidden` へリダイレクトする。
- ログイン済みユーザーが `/login` に来た場合は、自身のダッシュボードへリダイレクトする。
- middleware.ts は入口制御に限定し、機能単位の詳細な業務権限までは持たせない。

## protected/layout.tsx のルール

- `src/app/(protected)/layout.tsx` では認証済み前提の共通レイアウトを組み立てる。
- 共通ヘッダー、ナビゲーション、ログインユーザー表示をここで扱う。
- role に応じてナビゲーション項目を切り替える。
- 認証情報の取得に失敗した場合は `/login` へ戻す。
- `carrier/layout.tsx` と `shipper/layout.tsx` では、それぞれのロール専用ナビゲーションや画面枠を追加する。

## feature 側の認可ルール

- feature 側では、ボタン活性、編集可否、メニュー表示などの細かい認可を扱う。
- 権限判定ロジックは `common/permissions` に寄せ、複数画面で再利用する。

## 認可制御フロー

```
1. ユーザーが URL にアクセスする
2. middleware.ts がログイン状態とロールを確認する
3. 許可された場合のみ対象 route group の layout.tsx が描画される
4. layout.tsx がセッション情報を読み込み、共通ヘッダーとナビゲーションを構成する
5. 各 page.tsx と feature が画面固有の表示制御と操作可否を判定する
```

## 禁止事項

- 画面コンポーネントで URL を直書きしない。
- `page.tsx` の中で直接 fetch を書かない。
- 認可制御を 1 箇所に集約しない（middleware.ts だけで全部やらない）。
- Route Handler でバックエンド API の単純中継を大量に作らない。
