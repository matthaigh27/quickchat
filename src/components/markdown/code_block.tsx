import { Check, Clipboard } from "lucide-react";
import React from "react";
import { memo, useState } from "react";
import { ScrollArea } from "../ui/scroll-area";

export const CodeBlock = memo(({ children, ...props }: { children: React.ReactNode }) => {
  const [isCopied, setIsCopied] = useState<Boolean>(false);
  const child = React.Children.only(children);
  const languageName = React.isValidElement(child) ? child.props.className : "";
  const match = /language-(\w+)/.exec(languageName);

  function extractText(children: React.ReactNode): string {
    // TODO: memo or something
    if (typeof children === "string") {
      return children;
    }

    if (React.isValidElement(children)) {
      return extractText(children.props.children);
    }

    if (Array.isArray(children)) {
      return children.map((child) => extractText(child)).join("");
    }

    // For other types (e.g., boolean, null, undefined), return an empty string
    return children ? children.toString() : "";
  }

  async function copyToClipboard() {
    if (!navigator.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(extractText(children));

    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }

  return (
    <div className="bg-[#22232A] rounded-[0.325rem] relative font-sans text-[16px] my-4 h-fit">
      <div className="flex items-center justify-between py-1.5 px-4">
        <span className="text-xs lowercase text-white">{match ? match[1] : ""}</span>

        <div className="flex items-center">
          <button
            className="flex gap-1.5 items-center rounded bg-none p-1 text-xs text-white"
            onClick={copyToClipboard}
          >
            {isCopied ? <Check size={18} /> : <Clipboard size={18} />}
            {isCopied ? "Copied!" : "Copy code"}
          </button>
        </div>
      </div>
      {/* TODO: use ScrollArea for nice scrollbar */}
      <pre className="bg-[#282C34] mt-0" {...props}>
        {children}
      </pre>
    </div>
  );
});

CodeBlock.displayName = "CodeBlock";
