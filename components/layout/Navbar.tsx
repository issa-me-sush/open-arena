"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sun, Moon, ChevronDown } from "lucide-react";
import { cn } from "@/components/ui/cn";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { models } from "@/lib/mockData";

export function Navbar({ className }: { className?: string }) {
  return (
    <header className={cn("sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="mx-auto flex h-14 w/full max-w-[1600px] items-center justify-between px-10">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 relative">
            {/* Light mode logo */}
            <Image src="/openservlogolight.svg" alt="OpenServ" width={20} height={20} className="block dark:hidden" />
            {/* Dark mode logo */}
            <Image src="/openservlogo.svg" alt="OpenServ" width={20} height={20} className="hidden dark:block" />
          </div>
          <Link href="/" className="text-sm font-semibold">
            Open Arena
          </Link>
        </div>
        <nav className="hidden gap-6 text-sm font-medium sm:flex" />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <ModelsDropdown />
        </div>
      </div>
    </header>
  );
}

function ModelsDropdown() {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        Models
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="center">
        <div className="flex flex-col gap-1">
          {models.map((model) => (
            <Link
              key={model.id}
              href={`/models/${model.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <Image
                src={`/models/${model.slug}.svg`}
                alt={model.name}
                width={24}
                height={24}
                className={"flex-shrink-0 " + ((model.slug === "gpt-5" || model.slug === "grok-4") ? "dark:brightness-0 dark:invert" : "")}
              />
              <span className="text-sm font-medium">{model.name}</span>
            </Link>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ThemeToggle() {
  const [isDark, setIsDark] = React.useState<boolean>(true);
  React.useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains("dark"));
  }, []);

  function onToggle() {
    const root = document.documentElement;
    const next = !root.classList.contains("dark");
    root.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
  }

  return (
    <button
      aria-label="Toggle theme"
      aria-pressed={isDark}
      onClick={onToggle}
      className="relative h-8 w-14 rounded-full border bg-secondary transition-colors hover:bg-secondary/80"
    >
      <span
        className={cn(
          "absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background shadow transition-transform",
          isDark ? "translate-x-6" : "translate-x-0"
        )}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-primary" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-accent" />
        )}
      </span>
      {/* track icons */}
      <div className="absolute inset-y-0 left-2 flex items-center">
        <Sun className="h-3.5 w-3.5 text-primary/60" />
      </div>
      <div className="absolute inset-y-0 right-2 flex items-center">
        <Moon className="h-3.5 w-3.5 text-accent/60" />
      </div>
    </button>
  );
}


