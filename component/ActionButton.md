# ActionButton

簡短說明

- 可重複使用的按鈕元件，支援 button 與 Next.js `Link`（由 `href` 決定）。
- 樣式固定為 `text-white font-bold bg-gray-400 px-3 py-2 rounded-md`。

Props

- `text?: React.ReactNode` — 按鈕顯示的文字或節點，預設為 `button`。
- `href?: string` — 若提供則渲染為 Next.js `Link`，否則渲染為 `<button>`。
- `onClick?: (e) => void` — 點擊事件處理器，參數為 `MouseEvent`，可呼叫 `e.preventDefault()` 阻止預設行為。
- `disabled?: boolean` — 若為 `true`，按鈕會變為 disabled（樣式會套上 `opacity-50 pointer-events-none`）。

行為與注意事項

- `href` 模式：使用 `next/link`，`onClick` 仍會被呼叫；若要阻止導向，`onClick` 中呼叫 `e.preventDefault()` 或把 `disabled` 設為 `true`。
- 樣式為固定字串，若需要不同樣式，請在使用端透過外層容器包裝或改寫元件。
- TypeScript 型別已定義在 `component/ActionButton.tsx`。

範例

- 基本 button

```tsx
import ActionButton from "component/ActionButton";

<ActionButton text="儲存" onClick={() => console.log("save")} />;
```

- Link 模式

```tsx
<ActionButton text="去提問" href="/question" />
```

- 禁用

```tsx
<ActionButton text="處理中" disabled />
```

檔案

- 元件實作：[component/ActionButton.tsx](component/ActionButton.tsx#L1-L80)

如要我把 README 翻成英文或把更多範例（例如 icon、size）加入，告訴我想要的選項。
