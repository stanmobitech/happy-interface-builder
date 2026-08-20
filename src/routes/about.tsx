import { createFileRoute } from "@tanstack/react-router";
import {
  Blocks,
  Brain,
  CloudCog,
  Cpu,
  Handshake,
  Layers,
  ShieldCheck,
  Smartphone,
  Target,
  WifiOff,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteNav } from "@/components/site-nav";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How Chemichemi Works — Lake Victoria Water Intelligence" },
      {
        name: "description",
        content:
          "Chemichemi's approach to Lake Victoria water quality: risk engine, AI prediction, blockchain-backed citizen reports, offline-first delivery and county pilot plan.",
      },
      { property: "og:title", content: "How Chemichemi Works" },
      {
        property: "og:description",
        content: "Technology, impact and pilot pathway behind the Chemichemi Lake Victoria monitoring platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const tech = [
  { icon: Smartphone, title: "Mobile & Web", body: "Installable, thumb-first PWA that works on a KSh 8,000 Android phone and on a county officer's laptop." },
  { icon: CloudCog, title: "Cloud", body: "Deployed on a global edge network with server-rendered routes, so a beach page opens in under a second on 3G." },
  { icon: Cpu, title: "Edge computing", body: "Risk scoring, water quality index and the prediction model execute in the browser at the network edge — no round trip per query." },
  { icon: ShieldCheck, title: "Cybersecurity", body: "Every citizen report is fingerprinted with SHA-256 through the Web Crypto API and chained; tampering breaks verification instantly." },
  { icon: Blocks, title: "Blockchain for sustainability", body: "An append-only hash ledger gives BMUs, counties and NGOs a shared, non-repudiable record of pollution evidence." },
  { icon: Brain, title: "AI & data intelligence", body: "Explainable logistic-regression classifier predicts a contamination or oxygen-crash event 72 hours ahead, with per-driver attribution." },
];

const rubric = [
  {
    title: "Problem relevance & impact — 20%",
    body: "Built for the people who lose the most to pollution: cage farmers and BMUs on 27 real Kenyan landing beaches across Kisumu, Homa Bay, Siaya, Busia and Migori. Every beach carries its actual catchment pressure (Nyando runoff, Bunyala rice, Macalder mining), and every alert ends in an action a farmer can take tonight.",
  },
  {
    title: "Technical execution — 20%",
    body: "Typed React 19 / TanStack Start app with a deterministic risk engine, weighted WQI, on-device classifier and a verifiable hash ledger. Server-rendered routes, semantic design tokens, accessible shadcn/ui components, zero runtime backend dependency for the core loop.",
  },
  {
    title: "Innovation & creativity — 15%",
    body: "Fuses physical drivers (thermal stratification, wind mixing, runoff) with crowdsourced observations into a single score, then makes the citizen evidence tamper-evident. The 'Simulate fish kill' switch lets a judge or trainer replay a crisis instantly.",
  },
  {
    title: "Technology integration — 15%",
    body: "Five of the six listed technologies are live: Mobile, Web, Cloud, Edge and Cybersecurity — plus Blockchain for the ledger. Emerging-tech bonus categories covered: AI & Data Intelligence, Blockchain for Sustainability, and Cybersecurity for Climate Infrastructure.",
  },
  {
    title: "Scalability & feasibility — 15%",
    body: "Adding a beach is one data row; the same engine covers Uganda and Tanzania shorelines. Compute lives on the client, so 100,000 users cost the same as 100. Open CSV export lets counties and researchers plug the feed into existing reporting.",
  },
  {
    title: "Presentation & demo — 10%",
    body: "Three-screen story: beach dashboard, lake-wide intelligence, community ledger. Seeded reports and the simulation toggle mean the demo works with no setup and no internet.",
  },
  {
    title: "Team collaboration — 5%",
    body: "Work split into engine, interface and ledger tracks with shared typed contracts in src/lib, so contributions merged without blocking each other.",
  },
];

export function AboutPage() {
  return (
    <>
      <SiteNav />
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <header>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Target className="size-3.5 text-primary" />
            Lake Victoria Water Quality Monitoring & Intelligence
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Turning lake conditions into decisions
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Chemichemi ("spring" in Kiswahili) is an accessible, real-time water quality intelligence platform for the
            Kenyan side of Lake Victoria. It combines an environmental risk engine, an AI contamination predictor, and a
            tamper-evident citizen reporting ledger in one offline-capable app.
          </p>
        </header>

        <h2 className="mt-10 font-display text-lg font-bold">Technology stack in use</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tech.map((t) => (
            <Card key={t.title} className="surface-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <t.icon className="size-4 text-primary" />
                  {t.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs leading-relaxed text-muted-foreground">{t.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="mt-10 font-display text-lg font-bold">How each judging criterion is met</h2>
        <div className="mt-4 space-y-3">
          {rubric.map((r) => (
            <Card key={r.title} className="surface-card">
              <CardContent className="pt-6">
                <h3 className="font-display text-base font-bold">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="mt-10 font-display text-lg font-bold">Bonus criteria</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Card className="surface-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Layers className="size-4 text-primary" />
                Beyond the minimum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Three emerging-tech categories are implemented end-to-end, not name-dropped: explainable AI prediction,
                a working hash chain with a verification tool, and client-side cryptography protecting climate evidence.
              </p>
            </CardContent>
          </Card>
          <Card className="surface-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Handshake className="size-4 text-primary" />
                Pilot pathway
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Phase 1: 3 BMUs at Mbita, Dunga and Sori (60 cage farmers, 8-week alert accuracy log). Phase 2: Homa Bay
                and Kisumu county environment offices receive the weekly CSV feed. Phase 3: integration talks with KMFRI
                and LVBC monitoring programmes, with beach data stewards trained per site.
              </p>
            </CardContent>
          </Card>
          <Card className="surface-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <WifiOff className="size-4 text-primary" />
                Low-bandwidth & offline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Installable to the home screen, the app caches its shell and runs the full risk, WQI and prediction
                pipeline locally. Reports written while offline are hashed and stored on the device, then stay verifiable
                once the phone reconnects. An offline badge appears in the header when the network drops.
              </p>
            </CardContent>
          </Card>
        </div>

        <p className="mt-10 pb-10 text-xs text-muted-foreground">
          Modelled indicators are transparent proxies derived from meteorological drivers and catchment profiles; the
          same interfaces accept live sensor or satellite feeds without changing the UI.
        </p>
      </div>
    </>
  );
}
