import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import Navbar from "./navbar";
import { useEffect, useRef, useState } from "react";

const WithMobileSidebar = ({ children }: { children: React.ReactNode }) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { data } = useQuery({ queryKey: ["navOpen"], queryFn: () => 0, staleTime: Infinity });

  useEffect(() => {
    if (data) {
      triggerRef.current?.click();
    }
  }, [data]);

  return (
    <>
      <Sheet>
        <SheetTrigger className="hidden" ref={triggerRef}>
          Open
        </SheetTrigger>
        <SheetContent side="left">
          <Navbar />
        </SheetContent>
      </Sheet>
      {children}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const WithDesktopSidebar = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex-col md:flex md:flex-row">
      <nav className="fixed w-64 hidden h-screen md:sticky md:flex md:flex-col border-r">
        <Navbar />
      </nav>
      {children}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────

const Sidebar = ({ children, ...props }: { children: React.ReactNode }) => {
  return (
    <WithDesktopSidebar {...props}>
      <WithMobileSidebar {...props}>{children}</WithMobileSidebar>
    </WithDesktopSidebar>
  );
};

export default Sidebar;
