import { create } from 'zustand'

const chapter00Dialogues = [
  { character: "葛麗特", text: "哥哥你看！那裡有一棟用餅乾做的房子欸！" },
  { character: "漢賽爾", text: "聞起來好香……" },
  { character: "葛麗特", text: "哥哥，我的肚子好餓哦@@" },
  { character: "漢賽爾", text: "我們一起過去看看吧！" },
];

const chapter01Dialogues = [
  { character: "慈祥的老婆婆", text: "哎呀，可憐的孩子們，餓壞了吧？快進來！這裡有吃不完的糖果和蛋糕，好好補充一下力氣吧！" },
  { character: "漢賽爾", text: "太好了葛麗特，我們有食物吃了！" },
];

const chapter02Dialogues = [
  { character: "葛麗特", text: "哥哥……這本食譜上寫著，她要把我們養胖然後烤來吃！她根本不是慈祥的奶奶，她是吃人的女巫！" },
  { character: "漢賽爾", text: "難怪這裡會有其他小孩的骨頭……我們不能坐以待斃！葛麗特，趁她還在廚房忙，我們得想辦法對付她，不然我們都會變成晚餐！" },
];

const battleDialogues = [
  { character: "女巫", text: "呵呵呵，聰明的小老鼠們，看來你們發現了我的秘密啊？可惜太遲了！火爐已經燒得通紅，乖乖成為我今晚的大餐吧！" },
  { character: "漢賽爾", text: "妹妹，快用魔杖對付她！" },
];

const useGameStore = create((set, get) => ({
  // 對話資料（各幕）
  dialogueData: chapter00Dialogues,
  chapter00Dialogues,
  chapter01Dialogues,
  chapter02Dialogues,
  battleDialogues,

  // 物品收集
  collectedItems: [],
  addItem: (item) => set((state) => ({
    collectedItems: state.collectedItems.includes(item)
      ? state.collectedItems
      : [...state.collectedItems, item],
  })),
  hasItem: (item) => get().collectedItems.includes(item),

  // 食譜是否已觸發（防止返回 explore 時重複彈出）
  recipeFound: false,
  setRecipeFound: () => set({ recipeFound: true }),

  // 分數
  score: 0,
  setScore: (score) => set({ score }),

  // 重置遊戲
  resetGame: () => set({
    collectedItems: [],
    recipeFound: false,
    score: 0,
  }),
}));

// 保持舊有匯出名稱相容性
const useDialogueStore = useGameStore;

export { useGameStore, useDialogueStore };
