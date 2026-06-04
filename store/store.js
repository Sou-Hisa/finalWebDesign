import { create } from 'zustand'

const allDialogueData = [
    {
      character: "葛麗特",
      text: "哥哥你看！那裡有一棟用餅乾做的房子欸！"
    },
    {
      character: "漢賽爾",
      text: "聞起來好香……"
    },
    {
      character: "葛麗特",
      text: "哥哥，我的肚子好餓哦@@"
    },
    {
      character: "漢賽爾",
      text: "我們一起過去看看吧！"
    }
];


// 建立 store hook
const useDialogueStore = create((set) => ({
    // states and actions
  score: 0,
  dialogueData: allDialogueData,
  setScore: (score) => set({ score })

}))


export { useDialogueStore }