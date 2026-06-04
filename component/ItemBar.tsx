"use client";

const ITEM_CONFIG: Record<string, { label: string; emoji: string }> = {
  note:  { label: "密碼紙條", emoji: "📜" },
  bones: { label: "白色骨頭", emoji: "🦴" },
  book:  { label: "骨骼百科", emoji: "📖" },
  wand:  { label: "巫婆魔杖", emoji: "🪄" },
};

interface ItemBarProps {
  collectedItems: string[];
}

export default function ItemBar({ collectedItems }: ItemBarProps) {
  return (
    <div className="w-full border-b-2 border-black bg-amber-50 px-4 py-2 flex items-center gap-2">
      <span className="text-xs text-gray-500 mr-2 shrink-0">物品收集欄</span>
      <div className="flex gap-3">
        {Object.entries(ITEM_CONFIG).map(([key, { label, emoji }]) => {
          const collected = collectedItems.includes(key);
          return (
            <div
              key={key}
              title={label}
              className={`flex flex-col items-center px-2 py-1 border rounded text-xs transition-all ${
                collected
                  ? "border-amber-500 bg-amber-100 text-amber-800"
                  : "border-gray-300 bg-gray-100 text-gray-400 grayscale opacity-40"
              }`}
            >
              <span className="text-lg">{emoji}</span>
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
