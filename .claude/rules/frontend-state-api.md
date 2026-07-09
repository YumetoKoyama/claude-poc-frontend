# フロントエンド 状態管理とAPI連携ルール

## Zustand 基本方針

- store は feature 配下に置く。`src/stores` に全機能の状態を集約しない。
- 1 つの巨大な store に集約しない。機能ごとに store を分離する。
- server state と UI state を混同しない。
- selector を経由して購読範囲を最小化する。
- 共有状態が必要な場合も、まずは feature 単位の store と selector で閉じることを優先する。

## Zustand の管理対象

Zustand で管理する対象は以下に限定する。

- モーダル開閉状態
- フィルタ条件
- 一時編集中のフォーム補助状態
- 画面内の選択状態
- 認証コンテキストの一部

API から取得した一覧や詳細データを無差別に永続 store に積み続けない。サーバーデータのキャッシュ戦略が必要なら、React Query などの導入を検討する。

## Zustand store の配置

- store ファイルは `features/[機能]/stores/[名前].store.ts` に配置する。
- テストは `features/[機能]/stores/[名前].store.test.ts` として隣に置く。
- role 直下に `stores/` をまとめず、機能単位（dashboard、shipments、cargoes、matching）で閉じる。

## API 連携 基本方針

- エンドポイント定義は `lib/api` または `feature/services` に集約する。
- リクエストとレスポンスの型は TypeScript で明示する。
- 画面コンポーネントで URL を直書きしない。
- 画面や UI コンポーネントから直接 `fetch` を書かない。
- 認証ヘッダ、CSRF、エラーマッピングは API クライアント（`lib/api/client.ts`）に寄せる。

## API 連携の推奨分割

| 役割 | 配置先 |
|---|---|
| 共通 HTTP クライアント | `src/lib/api/client.ts` |
| 機能別 API 呼び出し | `src/features/*/services/*.ts` |
| バリデーション | `src/features/*/schemas/*.ts` |
| DTO 型 | `src/features/*/types/*.ts` |

## ロール別 API の配置

- 運送業者向け API は `carrier` feature 配下で扱う。
- 荷主向け API は `shipper` feature 配下で扱う。
- ログイン、ログアウト、パスワード変更など認証系 API は `auth` feature 配下で扱う。
- ヘッダー表示用のユーザー情報や権限情報は `auth` または `common/permissions` から参照する。
- 役割共通の API でも、shipment 系は `carrier/shipments`、cargo 系は `shipper/cargoes` のように業務機能単位へ寄せる。

## 認証・認可で利用する補助 API

- セッション確認用の Route Handler は `src/app/api/auth/session/route.ts` に置く。
- `middleware.ts` では Cookie やトークンの有無を見て粗い判定を行う。
- 詳細なユーザー属性や権限セットは `layout.tsx` または auth service で取得する。

## バックエンド別リポジトリ前提の境界

フロントエンドは Spring Boot バックエンドを別リポジトリとして扱うため、通信境界を明示的に持つ。

- フロントエンドが直接バックエンドの認証 API を都度叩かずに済むよう、BFF 的な補助 API として `route.ts` を使う。
- Cookie の受け渡し、ヘッダ整形、フロント向けレスポンス整形を Route Handler で吸収できる。
- ただし Route Handler は認証、セッション確認、フロント固有のレスポンス整形が必要なものに限定する。

## 禁止事項

- `page.tsx` の中で直接 API 呼び出しをしない。
- UI コンポーネント内で直接 `fetch` を書かない。
- API から取得したデータを無差別に Zustand store に永続保存しない。
- エンドポイントの URL を画面コンポーネントに直書きしない。
- Route Handler でバックエンド API の単純中継を大量に作らない。
