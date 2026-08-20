import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Droplets, WifiOff } from "lucide-react";

import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/intelligence", label: "Intelligence" },
  { to: "/reports", label: "Reports" },
  { to: "/about", label: "About" },
] as const;

export function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

export function SiteNav() {
  const online = useOnline();

  return (
    <div className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg border border-primary/30 bg-primary/15">
            <Droplets className="size-4 text-primary" />
          </span>
          <span className="font-display text-sm font-bold tracking-tight">Chemichemi</span>
        </Link>

        <div className="-mx-1 flex flex-1 items-center gap-1 overflow-x-auto px-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: cn("bg-secondary/70 text-foreground") }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {!online && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-caution/30 bg-caution/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-caution">
            <WifiOff className="size-3" />
            Offline mode
          </span>
        )}
      </nav>
    </div>
  );
}
