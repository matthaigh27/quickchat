import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import LocalDB, { type MessageRecord } from "../local_db";
import { type DBType } from "../db_types";
import { OpenAI } from "openai";
import { useMemo, useRef } from "react";
import { type ChatRecord } from "../local_db";

function useOpenai() {
  const { data: apiKey } = useQuery({
    queryKey: ["apiKey"],
    queryFn: async () => {
      const key = await LocalDB.settings.findBy("name", "openaiApiKey");

      return key?.value ?? null;
    },
  });

  const openai = useMemo(() => {
    return new OpenAI({
      apiKey: apiKey ?? "",
      dangerouslyAllowBrowser: true,
    });
  }, [apiKey]);

  return openai;
}

export function useMessages(chatId?: number | null) {
  const speaker = useRef<"user" | "assistant">("user");
  const queryClient = useQueryClient();
  const openai = useOpenai();

  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => LocalDB.messages.findManyBy("chatId", chatId),
    enabled: !!chatId,
  });

  const { mutate: addMessage } = useMutation({
    mutationFn: async (message: DBType<"insert", MessageRecord>) => {
      speaker.current = "assistant";

      const chat = await LocalDB.chats.get(message.chatId);
      console.log(chat?.title);
      if (chat?.title === "New Conversation") {
        const newTitle = message.content.substring(0, 25);
        await LocalDB.chats.update(message.chatId, { title: newTitle });
        queryClient.setQueryData(["chats"], (oldData: DBType<"read", MessageRecord>[]) => {
          return oldData.map((chat) => (chat.id === message.chatId ? { ...chat, title: newTitle } : chat));
        });
      }

      // TODO: can this be done in one go?
      await LocalDB.messages.add(message);
      await LocalDB.messages.add({
        chatId: message.chatId,
        message: "assistant",
        role: "assistant",
        content: "",
      });
    },
    onSuccess: async () => {
      const messages = await queryClient.fetchQuery({
        queryKey: ["messages", chatId],
        queryFn: async () => LocalDB.messages.findManyBy("chatId", chatId),
      });

      const placeholderMessage = messages.pop();

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        temperature: 0,
        messages: [
          {
            role: "system",
            content:
              "You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown and latex.",
          },
          ...messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ],
        stream: true,
      });

      let responseText = "";
      for await (const chunk of response) {
        const { content } = chunk.choices[0].delta;
        if (!content) continue;

        responseText += content;
        queryClient.setQueryData(["messages", chatId], (oldMessages: MessageRecord[]) => {
          const lastMessage = oldMessages.pop();
          if (!lastMessage) return oldMessages;

          return [...oldMessages, { ...lastMessage, content: responseText }];
        });
      }

      LocalDB.messages.update(placeholderMessage?.id!, { content: responseText });

      queryClient.invalidateQueries({
        queryKey: ["messages", chatId],
      });

      speaker.current = "user";
    },
  });

  return {
    messages,
    isLoading,
    addMessage,
    speaker: speaker.current,
  } as const;
}
