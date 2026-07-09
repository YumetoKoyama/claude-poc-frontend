# Vitest + React テスト方針: `userEvent` 実践ガイド

## `fireEvent` を許可する例外ケース

`fireEvent` は原則禁止とし、`userEvent` では十分に表現しづらい低レベルイベントに限って使用を認める。

- `scroll` / `resize` / `animationend` / `transitionend`
- `drag` 系の特殊イベント
- ブラウザ API 由来のカスタムイベント
- 実ブラウザの低レベルイベントを厳密に模倣する必要があるケース
- ライブラリ都合で直接イベント発火しか手段がないケース

`fireEvent` を使う場合は、なぜ `userEvent` ではなく `fireEvent` が必要かをコメントで明示すること。コメントなしの `fireEvent` 使用は禁止する。

```ts
// userEvent では表現しづらい scroll イベントを検証するため fireEvent を使用
fireEvent.scroll(container, { target: { scrollTop: 200 } })
```

## Claude Code への指示

React / Next.js / Vitest / Testing Library のテストコードを生成・編集する際、以下を必ず守ること。

1. `fireEvent` を使わず、可能な限り `userEvent` を使用すること
2. `userEvent.setup()` を用意し、`const user = userEvent.setup()` の形式で利用すること
3. `userEvent` の呼び出しは `await` を付与すること
4. 要素取得は `getByRole` / `getByLabelText` などアクセシブルクエリを優先すること
5. 既存コードに `fireEvent` がある場合、ユーザー操作として表現可能なら `userEvent` に置き換えること
6. `fireEvent` を残す場合は、`userEvent` では十分でない合理的理由をコメントで残すこと
7. 入力テストでは `fireEvent.change` ではなく `user.type` / `user.clear` を使うこと
8. キーボード操作では `fireEvent.keyDown` より `user.keyboard` を優先すること
9. クリック・ダブルクリック・ホバー・タブ移動は `user.click` / `user.dblClick` / `user.hover` / `user.tab` を使うこと
10. テストはユーザーの振る舞いベースで記述し、実装詳細ベースのイベント発火を避けること

## 推奨テンプレート

```ts
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'

describe('Component', () => {
  it('ユーザー操作を正しく処理する', async () => {
    const user = userEvent.setup()

    render(<Component />)

    await user.type(screen.getByLabelText('タイトル'), 'サンプル')
    await user.click(screen.getByRole('button', { name: '保存' }))

    expect(screen.getByText('保存しました')).toBeInTheDocument()
  })
})
```

## レビューチェックリスト

- [ ] `fireEvent` ではなく `userEvent` を使っているか
- [ ] `const user = userEvent.setup()` を使っているか
- [ ] `user` 操作に `await` を付けているか
- [ ] `getByRole` / `getByLabelText` を優先しているか
- [ ] 実装詳細ではなくユーザー行動ベースでテストしているか
- [ ] `fireEvent` を使う場合、理由コメントがあるか

## 非推奨パターン

```ts
fireEvent.click(...)
fireEvent.change(...)
fireEvent.input(...)
fireEvent.keyDown(...)
fireEvent.focus(...)
fireEvent.blur(...)
```

ユーザー操作として自然に置き換え可能であれば、原則 `userEvent` に変更すること。

## 基本方針

テストは「DOM にイベントを打ち込む」ためではなく、「ユーザーがアプリをどう使うか」を検証するために書く。Vitest における React / Next.js の UI テストでは、`fireEvent` ではなく `userEvent` を第一選択とする。
