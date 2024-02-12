"use client";

import { cn } from "@/lib/utils";
import { MessageRecord } from "@/lib/local_db";
import { Bot, User } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { CodeBlock } from "../markdown/code_block";
import { memo } from "react";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/atom-one-dark.css";

function ChatMessage({ message }: { message: MessageRecord }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "md:px-4 border-b",
        isUser ? "text-gray-800 border-gray-900/50 bg-[#343541] dark:text-gray-100" : "bg-[#444654]"
      )}
    >
      <div className="m-auto flex p-4 text-base md:gap-6 md:py-6 md:max-w-2xl lg:px-0 xl:max-w-3xl">
        <div className="min-w-[40px] text-right font-bold">{isUser ? <User size={30} /> : <Bot size={30} />}</div>
        <Markdown
          className="prose prose-invert flex-1"
          rehypePlugins={[rehypeKatex, rehypeHighlight]}
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({ children, className }) {
              return <span className={className}>{children}</span>;
            },
            pre({ node, children, ...props }) {
              return <CodeBlock {...props}>{children}</CodeBlock>;
            },
            table({ children }) {
              return <table className="border-collapse border px-3 py-1 border-white">{children}</table>;
            },
            th({ children }) {
              return <th className="break-words border bg-gray-500 px-3 py-1 text-white border-white">{children}</th>;
            },
            td({ children }) {
              return <td className="break-words border px-3 py-1 border-white">{children}</td>;
            },
          }}
        >
          {message.content
            .replaceAll("\\(", "  $")
            .replaceAll("\\)", "$")
            .replaceAll("\\[", "  $$")
            .replaceAll("\\]", "$$")}
        </Markdown>
      </div>
    </div>
  );
}

export default memo(ChatMessage, ({ message: oldMessage }, { message: newMessage }) => {
  return oldMessage.content.length === newMessage.content.length;
});
