"use client";

import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { useRef, useCallback, memo, forwardRef, ForwardedRef, useEffect } from "react";

function ChatBar({ onSend }: { onSend: (input: string) => void }) {
  const blurContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = useCallback(() => {
    if (!blurContainerRef.current || !inputRef.current) return;

    inputRef.current.style.height = "auto";
    inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    blurContainerRef.current.style.height = `${inputRef.current.scrollHeight + 50}px`;
  }, []);

  const handleSend = useCallback(() => {
    if (!inputRef.current) return;

    onSend(inputRef.current.value);

    inputRef.current.value = "";
    handleInput();
  }, [handleInput, onSend]);

  return (
    <div
      ref={blurContainerRef}
      className="absolute min-h-24 bottom-0 left-0 w-full bg-gradient-to-b from-transparent via-[#343541] to-[#343541] border-white/20 flex justify-center items-center"
    >
      <div
        className={cn(
          "min-h-12 max-h-fit w-11/12 px-2 gap-2 border flex items-center justify-between",
          "md:max-w-2xl xl:max-w-3xl",
          "border-gray-900/50 bg-[#40414F] rounded-[.375rem]",
          "text-white shadow-[0_0_15px_rgba(0,0,0,0.10)]"
        )}
      >
        <div className="w-[20px]" />
        <MemoizedChatTextArea onInput={handleInput} ref={inputRef} handleSend={handleSend} />
        <button onClick={handleSend} className="mb-auto mt-[13px]">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

const ChatTextArea = forwardRef(
  (
    { onInput, handleSend }: { onInput: (e: React.FormEvent<HTMLTextAreaElement>) => void; handleSend: () => void },
    ref: ForwardedRef<HTMLTextAreaElement>
  ) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    return (
      <Textarea
        ref={ref}
        placeholder="Type a message..."
        onInput={onInput}
        onKeyDown={handleKeyDown}
        rows={1}
        className="py-2 w-full resize-none bg-inherit h-9"
      />
    );
  }
);

ChatTextArea.displayName = "ChatTextArea";

const MemoizedChatTextArea = memo(ChatTextArea);

export default memo(ChatBar);
