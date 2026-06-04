"use client"

import { useState } from "react";
import { useDialogueStore } from "../../store/store"

import ActionButton from "../../component/ActionButton";

export default function Chapter00() {
  const [dialogueIndex, setDialogueIndex] = useState(0);
  
  const dialogueData = useDialogueStore( (state) => state.dialogueData );
  const currentDialogue = dialogueData[dialogueIndex];
  const isLastDialogue = dialogueIndex === dialogueData.length - 1;

  function nextDialogue(){
    if (!isLastDialogue) {
      setDialogueIndex((currentIndex) => currentIndex + 1);
    }
  }

  return (
    <div className="w-full h-screen bg-gray-200">
      <div className="w-full h-screen flex flex-col gap-4 p-6">


        <div className="flex flex-1 items-center justify-center">
          
        </div>

        <div className="mx-10 flex items-end justify-between gap-4">
          <div className="min-w-24 border-2 border-black bg-white px-5 py-2 text-center font-medium">
            {currentDialogue.character}
          </div>
          <ActionButton
            text="繼續"
            className="border-2 border-red-500 px-5 py-2 font-medium text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={nextDialogue}
            disabled={isLastDialogue}
          >
            {/* {isLastDialogue ? "結束" : "繼續"} */}
          </ActionButton>

        </div>

        <div className="mx-10 min-h-16 border-2 border-black bg-white px-5 py-4 text-lg">
          <p>{currentDialogue.text}</p>
        </div>
      </div>
    </div>
  );

}
