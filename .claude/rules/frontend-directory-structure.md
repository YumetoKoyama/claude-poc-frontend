# フロントエンド ディレクトリ構成と責務ルール

## 基本方針

- 技術別（components/stores/hooks）ではなく機能別に構成する。
- 業務機能単位で code ownership を閉じる。
- 機能追加に応じて `features` 配下を増やし、共通化が必要になった時点で `components` や `lib` に昇格させる。

## 推奨ディレクトリ構成（最小）

```text
src/
├─ app/
├─ features/
├─ components/
├─ lib/
├─ test/
└─ styles/
```

最初から過剰に分割しすぎない。アプリ特性上、最初から `app` 配下では `public`、`protected`、`carrier`、`shipper` の責務を分けておく。

## src/app の責務

- ルーティング、レイアウト、画面エントリのみを配置する。
- `page.tsx` は画面エントリとして薄く保つ。
- 業務ロジック、状態変更、API 呼び出しは直接持たせない。
- `(public)` と `(protected)` を route group で分離する。
- carrier と shipper は URL と route segment を分け、ロールごとの画面差分を明示する。

## src/features の責務

- 業務機能単位の実装を配置する。アプリケーションの中心となる層。
- 1 機能ごとに 1 ディレクトリを切る。
- 機能ごとに `components`、`hooks`、`services`、`stores`、`schemas`、`types` を持てるようにする。
- store や service の実体ファイルは、それぞれ `stores`、`services` などの責務ディレクトリ配下に配置する。
- custom hook も role 直下に集約せず、対象機能の配下に置く。
- 他機能から参照される公開 API は barrel export か明示 import に限定する。
- carrier と shipper の feature は分離し、共通化が必要な要素だけ `common` に寄せる。

## role 配下の構成ルール

carrier と shipper はロール境界として有効だが、その直下を技術別ディレクトリにすると責務が広がる。

- **良い例**: `carrier/shipments/hooks`、`carrier/shipments/stores`、`shipper/cargoes/types`
- **避ける例**: `carrier/hooks`、`carrier/stores`、`shipper/types`

role 配下の `common` は、そのロールの複数機能でだけ共有する hook、型、サービスに限定する。全体共通なら `features/common` に置く。

## src/components の責務

コンポーネントの分類・配置・命名・Barrel Export の詳細は `frontend-component-design.md`（Atomic Design ルール）を参照すること。

概要:
- 機能に依存しない共通 UI（atoms・molecules・organisms・templates）を配置する。
- 特定 feature にしか使わない organisms は `features/<feature>/components/` に置き、複数 feature で再利用が必要になった時点でここへ昇格させる。

## src/lib の責務

共通インフラのみを配置する。何でも置く場所にしない。feature に閉じられるものは `features` 側に置く。

配置するもの:

- `lib/api/client.ts` - 共通 HTTP クライアント
- `lib/api/interceptors.ts` - 認証ヘッダ・CSRF・エラーマッピング
- `lib/api/errors.ts` - エラーマッピング
- `lib/env/client-env.ts` - 環境変数の読み出し
- `lib/utils/` - 汎用ユーティリティ（date、string など）
- `lib/constants/` - 定数

## src/test の責務

テスト共通設定のみを配置する。

- `test/setup.ts` - Vitest の初期化
- `test/render.tsx` - React Testing Library 用の共通 render
- `test/msw/handlers.ts` - MSW ハンドラ
- `test/msw/server.ts` - MSW サーバー設定
- `test/fixtures/` - テストデータ fixture

個々のテストファイル（`*.test.ts`）はソースの近くに置く。`test` ディレクトリに一括集約しない。

## src/hooks の責務

- 機能に依存しないグローバルな custom hook のみ置く。
- 業務依存の custom hook は `features/*/hooks/` に置く。

## ルートファイル

- `middleware.ts` はプロジェクトルートに置く。
- `vitest.config.ts`、`next.config.ts`、`tsconfig.json` はプロジェクトルートに置く。
- `.env.local` はプロジェクトルートに置く。

## 禁止事項

- `src/stores` に全機能の状態を集約しない。
- `src/hooks` に業務依存の custom hook を集約しない。
- `src/components` に業務依存コンポーネントを大量に置かない（詳細は `frontend-component-design.md` を参照）。
- carrier や shipper の直下に巨大な `hooks`、`stores`、`types`、`services` ディレクトリを作らない。
- テストを `tests` ディレクトリに一括集約し、対象コードとの対応が見えなくなる構成にしない。
- feature をまたいだ循環参照を許容しない。
