# Vitest + React テスト方針: `userEvent` 優先ルール

## 目的

React / Next.js + Vitest + Testing Library のテストにおいて、`fireEvent` ではなく `userEvent` を標準で使用するためのガイドライン。

`userEvent` は実際のユーザー操作（クリック、入力、タブ移動、選択など）により近い形でイベントを発火できるため、UI テストの信頼性・可読性・保守性が向上する。

## 適用対象

- React コンポーネントのユニットテスト
- Next.js のクライアントコンポーネントテスト
- `@testing-library/react` を利用する Vitest ベースの UI テスト

## ユーザー操作には `userEvent` を使う

以下のような操作では、`fireEvent` ではなく `userEvent` を使用すること。

- ボタンクリック / テキスト入力 / チェックボックスの ON/OFF
- ラジオボタン選択 / セレクトボックス操作
- キーボード操作 / フォーカス移動 / タブ移動
- ダブルクリック / ホバー / フォーム送信に相当する操作

禁止:

- `fireEvent.click(...)` / `fireEvent.change(...)` / `fireEvent.input(...)`
- `fireEvent.keyDown(...)`（ユーザー操作として表現できる場合）

推奨:

- `await user.click(...)` / `await user.type(...)` / `await user.clear(...)`
- `await user.selectOptions(...)` / `await user.keyboard(...)` / `await user.tab()` / `await user.hover(...)`

## `userEvent.setup()` を使う

`userEvent` は毎テストで `setup()` したインスタンスを使うこと。

```ts
const user = userEvent.setup()
```

推奨パターン:

```ts
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('ユーザーがメールアドレスとパスワードを入力して送信できる', async () => {
    const user = userEvent.setup()

    render(<LoginForm />)

    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com')
    await user.type(screen.getByLabelText('パスワード'), 'password123')
    await user.click(screen.getByRole('button', { name: 'ログイン' }))

    expect(screen.getByText('送信中')).toBeInTheDocument()
  })
})
```

## `userEvent` の呼び出しは `await` を付ける

`userEvent` による操作は内部的に複数イベントやフォーカス遷移を伴うため、原則 `await` を付けて呼び出すこと。

```ts
await user.click(button)
await user.type(input, 'hello')
await user.keyboard('{Enter}')
```

禁止:

```ts
user.click(button)      // await なし
user.type(input, 'hello')  // await なし
```

## 要素取得はアクセシブルクエリを優先する

`userEvent` を使うテストでは、ユーザーが実際に認識する UI に合わせて要素取得を行うこと。

優先順位:

1. `getByRole`
2. `getByLabelText`
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId`（最後の手段）

推奨:

```ts
screen.getByRole('button', { name: '保存' })
screen.getByLabelText('メールアドレス')
```

非推奨:

```ts
screen.getByTestId('save-button')
```

## `fireEvent` を使ってはいけないケース

以下は `fireEvent` を `userEvent` に置き換えること。

### クリック

```ts
// NG
fireEvent.click(screen.getByRole('button', { name: '追加' }))
// OK
await user.click(screen.getByRole('button', { name: '追加' }))
```

### 入力

```ts
// NG
fireEvent.change(screen.getByLabelText('名前'), { target: { value: 'Taro' } })
// OK
await user.type(screen.getByLabelText('名前'), 'Taro')
```

### クリアして再入力

```ts
// NG
fireEvent.change(input, { target: { value: '' } })
fireEvent.change(input, { target: { value: 'new value' } })
// OK
await user.clear(input)
await user.type(input, 'new value')
```

### キーボード入力

```ts
// NG
fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })
// OK
await user.keyboard('{Enter}')
```

### チェックボックスとセレクトボックス

```ts
// NG
fireEvent.click(screen.getByLabelText('利用規約に同意する'))
fireEvent.change(screen.getByLabelText('国'), { target: { value: 'jp' } })
// OK
await user.click(screen.getByLabelText('利用規約に同意する'))
await user.selectOptions(screen.getByLabelText('国'), 'jp')
```
