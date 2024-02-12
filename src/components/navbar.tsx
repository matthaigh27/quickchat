"use client";

import { useChats, useCurrentChat } from "@/lib/hooks/chats";
import { Loader2, Plus, Trash } from "lucide-react";
import { ChatRecord } from "@/lib/local_db";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { type DBType } from "@/lib/db_types";
import SettingsButton from "./settings_dialog";
import { Separator } from "./ui/separator";

export default function Navbar() {
  const { chats, isLoading, addChat, removeChat } = useChats();
  const { currentChatId, setCurrentChatId } = useCurrentChat();

  if (isLoading) {
    return <Loader2 className="mx-auto mt-6 animate-spin" />;
  }

  return (
    <div className="h-full flex flex-col md:px-4">
      <div className="flex my-4">
        <Button
          variant="outline"
          className="flex gap-2 justify-start w-full rounded-[0.325rem] border border-[hsla(0,0%,100%,.2)]"
          onClick={() => {
            addChat("New Conversation");
          }}
        >
          <Plus size={16} />
          New Chat
        </Button>
      </div>

      <ScrollArea className="grow">
        <ul className="flex flex-col gap-2">
          {chats &&
            chats.toReversed().map((chat) => (
              <li key={chat.id}>
                <ChatItem
                  chat={chat}
                  onDelete={removeChat}
                  onClick={setCurrentChatId}
                  selected={chat.id === currentChatId}
                />
              </li>
            ))}
        </ul>
        <ScrollBar />
      </ScrollArea>

      <Separator className="h-[1px] bg-[hsla(0,0%,100%,.2)]" />

      <div className="flex justify-center items-center min-h-24">
        <SettingsButton />
      </div>
    </div>
  );
}

function ChatItem({
  chat,
  onClick,
  onDelete,
  selected,
}: {
  chat: DBType<"read", ChatRecord>;
  onClick: (id: number) => void;
  onDelete: (id: number) => void;
  selected?: boolean;
}) {
  if (selected) {
    return (
      <div className="flex w-full font-medium rounded-[0.325rem] border border-[hsla(0,0%,100%,.2)] items-center justify-between p-4 max-h-14 min-h-14 bg-[#32333E]">
        <p className="block text-sm w-36 overflow-x-hidden text-ellipsis text-nowrap">{chat.title}</p>
        <Button
          size="sm"
          variant="ghost"
          className="rounded w-fit h-fit aspect-square p-2"
          onClick={() => onDelete(chat.id)}
        >
          <Trash size={14} />
        </Button>
      </div>
    );
  }

  return (
    <Button
      className="flex w-full rounded-[0.325rem] border border-[hsla(0,0%,100%,.2)] h-full items-center justify-between p-4 max-h-14 min-h-14"
      variant="outline"
      onClick={() => {
        onClick(chat.id);
      }}
    >
      <p className="text-sm">{chat.title}</p>
    </Button>
  );
}
