"use client";

interface DialogueBoxProps {
  character: string;
  text: string;
  onNext: () => void;
  isLast: boolean;
  nextLabel?: string;
  lastLabel?: string;
}

export default function DialogueBox({
  character,
  text,
  onNext,
  isLast,
  nextLabel = "繼續",
  lastLabel = "繼續",
}: DialogueBoxProps) {
  return (
    <div className="mx-6 mb-6 flex flex-col gap-2">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-28 border-2 border-black bg-white px-4 py-2 text-center font-medium text-sm">
          {character}
        </div>
        <button
          onClick={onNext}
          className="border-2 border-red-500 px-5 py-2 font-medium text-red-500 hover:bg-red-500 hover:text-white transition-colors"
        >
          {isLast ? lastLabel : nextLabel}
        </button>
      </div>
      <div className="min-h-16 border-2 border-black bg-white px-5 py-4 text-lg">
        <p>{text}</p>
      </div>
    </div>
  );
}
