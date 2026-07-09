# フロントエンド テスト戦略と命名ルール

## テストの対象範囲

本リポジトリで実施するテストは、フロントエンド単体で検証可能な範囲に限定する。

- デプロイ後の疎通確認や業務シナリオ確認は、AWS 環境上で別のテスト工程として扱う。
- そのため、本リポジトリのディレクトリ構成に e2e 専用ディレクトリは含めない。

## 単体テストのルール

対象:

- UI コンポーネント
- カスタムフック
- Zustand store
- フォーマッタやバリデーション関数
- API 呼び出しラッパ

配置ルール:

- ソースの近くに `*.test.ts` または `*.test.tsx` を置く。
- 責務ディレクトリを切る場合は、その配下で対象ファイルの隣に置く。
- `test/` ディレクトリへの一括集約は禁止。対象コードとの対応が見えなくなるため。

配置例:

```
stores/auth.store.ts       → stores/auth.store.test.ts
UserTable.tsx              → UserTable.test.tsx
```

## 結合寄りテストのルール

対象:

- 画面と feature の結合
- API モックを使った表示分岐
- フォーム送信から結果表示までの一連動作

配置:

- feature 直下または対象コンポーネント近傍に置く。

## テスト共通設定の配置

`src/test/` には共通設定のみを置く。

```
src/test/
├─ setup.ts          # Vitest 初期化
├─ render.tsx        # React Testing Library 共通 render
├─ msw/
│  ├─ handlers.ts    # MSW ハンドラ
│  └─ server.ts      # MSW サーバー設定
└─ fixtures/         # テストデータ fixture
```

## デプロイ後テストとの分担

| 本リポジトリ | AWS デプロイ後（別工程） |
|---|---|
| UI コンポーネント | バックエンド連携 |
| 状態管理 | 認証連携 |
| 入力検証 | 環境差異 |
| 画面内の表示分岐 | 実通信を含む業務シナリオ |

## 採用テストツール

- 単体テスト: Vitest、React Testing Library
- API モック: Mock Service Worker（MSW）
- バリデーション: Zod

## 命名ルール

### ファイル名

- ディレクトリは既存チーム規約に合わせて統一する（kebab-case を基本とする）。
- feature 名は業務単位の英語名にする。
- React コンポーネントは PascalCase にする。
- store、service、schema、test は役割が分かる接尾辞を付ける。

### 接尾辞の規則

| ファイルの役割 | 接尾辞例 |
|---|---|
| Zustand store | `.store.ts` |
| API サービス | `.service.ts` |
| Zod スキーマ | `.schema.ts` |
| 単体テスト | `.test.ts` / `.test.tsx` |
| React コンポーネント | `PascalCase.tsx` |
| コンポーネントテスト | `PascalCase.test.tsx` |

命名例:

```
user-profile.store.ts
user-profile.service.ts
UserProfileCard.tsx
UserProfileCard.test.tsx
```

## 避けるべき構成

- `src/stores` に全機能の状態を集約する
- `src/hooks` に業務依存の custom hook を集約する
- `src/components` に業務依存コンポーネントを大量に置く
- `page.tsx` の中で直接 API 呼び出しと状態更新を行う
- feature をまたいだ循環参照を許容する
- carrier や shipper の直下に巨大な `hooks`、`stores`、`types`、`services` ディレクトリを作る
- テストを `tests` ディレクトリに一括集約し、対象コードとの対応が見えなくなる
- e2e テスト（Playwright 等）を本リポジトリに含める
