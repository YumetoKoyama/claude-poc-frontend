# フロントエンド コンポーネント設計ルール（Atomic Design）

## 基本方針

- コンポーネントは Atomic Design の 5 階層に分類して配置する。
- 階層を超えた逆参照（上位が下位を import するのは許可、下位が上位を import するのは禁止）を行わない。
- 業務ロジックは organisms 以上に閉じ、atoms・molecules は業務文脈を持たない。

## 5 階層の定義と配置先

| 階層 | 配置先 | 説明 | 例 |
|---|---|---|---|
| atoms | `src/components/atoms/` | これ以上分解できない最小単位。1 つの HTML 要素またはごく単純な組合せ。ステートレス（UI state のみ許可）。 | Button, Input, Label, Icon, Badge, Spinner |
| molecules | `src/components/molecules/` | atoms を組み合わせた単一目的の UI 部品。最小限の内部 state のみ。データ取得・グローバル state 接続は持たない。 | FormField, SearchForm, Card |
| organisms | `src/components/organisms/` | 業務文脈を持つ UI セクション。store 接続・業務ロジックを持ってよい。複数画面で再利用される場合に `components/organisms/` へ昇格させる。それ以外は `features/` 配下に置く。 | Header, LoginForm, ShipmentTable |
| templates | `src/components/templates/` | ページ全体のレイアウト構造を定義する。実データを持たず、children / slot でコンテンツを受け取る。 | MainLayout, AuthLayout, DashboardLayout |
| pages | `src/app/` 配下の `page.tsx` | Next.js App Router の page.tsx が担う。templates を使い実データと接続する。 | （Next.js ルーティング構造に従うため独立ディレクトリを設けない） |

## 分類の判断フロー

1. これ以上分解できないか → **atoms**
2. atoms を組み合わせた単一目的か → **molecules**
3. 業務ロジック・store 接続を持つか → **organisms**（機能固有なら `features/` 配下）
4. ページ構造のみ定義するか → **templates**
5. 実データと接続するページか → **pages**（`src/app/` の `page.tsx`）

## 命名規則

| 種別 | 規則 | 例 |
|---|---|---|
| コンポーネントファイル | PascalCase | `Button.tsx`, `FormField.tsx`, `LoginForm.tsx` |
| ディレクトリ名 | PascalCase（コンポーネント名に合わせる） | `Button/`, `FormField/` |
| templates | 接尾辞 `Layout` を付ける | `AuthLayout`, `DashboardLayout` |
| テストファイル | 対象ファイルと同じ名前 + `.test.tsx` | `Button.test.tsx` |

## features/ との関係

- organisms のうち **特定 feature にしか使わない** ものは `features/<feature>/components/` に置く。
- 複数 feature で再利用が必要になった時点で `src/components/organisms/` へ昇格させる。
- atoms・molecules は業務文脈を持たないため、常に `src/components/` 配下に置く。

## Barrel Export

各階層に `index.ts` を置き、外部からは階層の index 経由で import する。

```ts
// src/components/atoms/index.ts
export { Button } from './Button';
export { Input } from './Input';
```

```ts
// 利用側
import { Button, Input } from '@/components/atoms';
import { FormField } from '@/components/molecules';
import { Header } from '@/components/organisms';
import { AuthLayout } from '@/components/templates';
```

## 禁止事項

- atoms・molecules に業務判定・store 接続・API 呼び出しを持ち込まない。
- templates に実データを渡す（children 以外の業務 props を持たせない）。
- organisms を `src/components/organisms/` に昇格させず、feature をまたいで直接 import させない。
- コンポーネント内で URL・エンドポイントを直書きする（`frontend-coding-rules.md` の定数管理ルールに従う）。
- 階層の逆参照（atoms が molecules を import するなど）を行う。
