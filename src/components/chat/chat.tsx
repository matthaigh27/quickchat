"use client";

import { useChats, useCurrentChat } from "@/lib/hooks/chats";
import { useMessages } from "@/lib/hooks/message";
import ChatMessage from "./chat_message";
import { ScrollArea } from "../ui/scroll-area";
import ChatBar from "./chat_bar";
import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";

export default function Chat() {
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { currentChatId } = useCurrentChat();
  const { messages, addMessage, speaker } = useMessages(currentChatId);
  const { addChat, newChatId } = useChats();
  const hasLoaded = useRef(false);
  const pendingMessage = useRef<string>();

  useEffect(() => {
    if (!pendingMessage?.current || !newChatId) {
      return;
    }

    addMessage({
      chatId: newChatId,
      message: "test",
      role: "user",
      content: pendingMessage.current,
    });

    pendingMessage.current = undefined;
  }, [addMessage, newChatId]);

  const handleSend = useCallback(
    async (input: string) => {
      if (speaker !== "user") return;
      if (!currentChatId) {
        addChat(input.substring(0, 25));
        pendingMessage.current = input;
        return;
      }

      addMessage({
        chatId: currentChatId,
        message: "test",
        role: "user",
        content: input,
      });
    },
    [addChat, addMessage, currentChatId, speaker]
  );

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // TODO: if user message go to bottom

    // TODO: kinda gross
    // make a message container that actually only loads with messages then [] will work
    if (!hasLoaded.current && (messages?.length ?? 0) > 0) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
      hasLoaded.current = true;
    }

    // TODO: figure out why this works
    if (scrollContainer.scrollHeight - 1000 - scrollContainer.scrollTop < 200) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div className="flex justify-between h-9 text-sm bg-[#444654] text-neutral-200 py-1 px-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden w-7 h-7 rounded-[0.325rem] flex justify-center items-center"
          onClick={() => {
            queryClient.setQueryData(["navOpen"], Date.now());
          }}
        >
          <Menu size={22} />
        </Button>
        <div />
        <div />
      </div>
      <div className="relative h-[calc(100dvh-2.25rem)]">
        <ScrollArea ref={scrollRef} className="h-full bg-[#343541]">
          {messages?.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div className="h-24" />
        </ScrollArea>
        <ChatBar onSend={handleSend} />
      </div>
    </>
  );
}
