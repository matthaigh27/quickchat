"use client";
import Sidebar from "@/components/sidebar";
import Chat from "@/components/chat/chat";

export default function Home() {
  return (
    <Sidebar>
      <main className="flex-1">
        <Chat />
      </main>
    </Sidebar>
  );
}
