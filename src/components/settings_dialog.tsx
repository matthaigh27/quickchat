"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LocalDB from "@/lib/local_db";
import { DialogClose } from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";

export default function SettingsButton() {
  const queryClient = useQueryClient();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const openaiApiKey = form.openaiApiKey.value;

    const currentValue = await LocalDB.settings.findBy("name", "openaiApiKey");
    if (currentValue) {
      LocalDB.settings.update("openaiApiKey", { value: openaiApiKey });
    } else {
      LocalDB.settings.add({
        name: "openaiApiKey",
        value: openaiApiKey,
      });
    }

    queryClient.invalidateQueries({ queryKey: ["apiKey"] });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full rounded-[0.325rem] border border-[hsla(0,0%,100%,.2)]">
          Edit Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                API Key
              </Label>
              <Input
                name="openaiApiKey"
                type="password"
                autoComplete="off"
                placeholder="sk-1234567890abcdefg"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit">Save changes</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
