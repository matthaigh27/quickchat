import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LocalDB from "@/lib/local_db";

export function useChats() {
  const queryClient = useQueryClient();
  const { setCurrentChatId } = useCurrentChat();

  const { data: chats, isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: () => LocalDB.chats.all(),
  });

  const { mutate: addChat, data: newChatId } = useMutation({
    mutationFn: async (title: string) => {
      const timestamp = new Date();

      const chats = await LocalDB.chats.all();
      if (chats.length) {
        const lastChat = chats.pop()!; // FIXME
        const messages = await LocalDB.messages.findManyBy("chatId", lastChat.id);

        if (!messages.length) {
          return lastChat!.id;
        }
      }

      const newId = await LocalDB.chats.add({ title: title, timestamp });
      return newId as number;
    },
    onSuccess: (newChatId: number) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      setCurrentChatId(newChatId);
    },
  });

  const { mutate: removeChat } = useMutation({
    mutationFn: (id: number) => {
      return LocalDB.chats.delete(id);
    },
    onSuccess: () => {
      // TODO: can this just manually update the cache?
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.setQueryData(["currentChat"], null);
      sessionStorage.removeItem("currentChatId");
    },
  });

  return {
    chats,
    isLoading,
    addChat,
    newChatId,
    removeChat,
  };
}

export function useCurrentChat() {
  const queryClient = useQueryClient();

  const { data: currentChatId, isLoading } = useQuery({
    queryKey: ["currentChat"],
    queryFn: async () => {
      const id = sessionStorage.getItem("currentChatId");

      if (id) {
        return parseInt(id);
      }

      const chats = await LocalDB.chats.all();
      if (chats.length > 0) {
        return chats[0].id;
      }

      return null;
    },
  });

  const { mutate: setCurrentChatId } = useMutation({
    mutationFn: async (id: number) => {
      sessionStorage.setItem("currentChatId", id.toString());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentChat"] });
    },
  });

  return {
    currentChatId,
    isLoading,
    setCurrentChatId,
  };
}
