import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Brain, Download, Droplets, Gauge, MapPin, TrendingUp, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RiskPill } from "@/components/risk";
import { SiteNav } from "@/components/site-nav";
import { cn } from "@/lib/utils";
import { buildIntel, byCounty, toCsv, type BeachIntel } from "@/lib/intelligence";
import { getReports, seedIfEmpty } from "@/lib/ledger";

export const Route = createFileRoute("/intelligence")({
  head: () => ({
    meta: [
      { title: "Lake Intelligence — Chemichemi Water Quality Platform" },
      {
        name: "description",
        content:
          "Lake-wide water quality index, AI contamination prediction and county hotspots for 27 Kenyan Lake Victoria beaches, with open CSV export.",
      },
      { property: "og:title", content: "Lake Intelligence — Chemichemi" },
      {
        property: "og:description",
        content: "County-level water quality intelligence and 72-hour contamination probability for Lake Victoria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: IntelligencePage,
});

function probTone(p: number) {
  if (p >= 0.7) return "text-critical";
  if (p >= 0.45) return "text-danger";
  if (p >= 0.2) return "text-caution";
  return "text-safe";
}

function wqiTone(v: number) {
  if (v >= 80) return "text-safe";
  if (v >= 65) return "text-safe";
  if (v >= 50) return "text-caution";
  if (v >= 35) return "text-danger";
  return "text-critical";
}

function IntelligencePage() {
  const [intel, setIntel] = useState<BeachIntel[]>([]);

  useEffect(() => {
    let cancelled = false;
    void seedIfEmpty().then(() => {
      if (!cancelled) setIntel(buildIntel(getReports()));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const counties = useMemo(() => byCounty(intel), [intel]);
  const top = intel[0];
  const avgWqi = intel.length ? Math.round(intel.reduce((a, i) => a + i.quality.wqi, 0) / intel.length) : 0;
  const alerts = intel.filter((i) => i.level === "DANGER" || i.level === "CRITICAL").length;

  const download = () => {
    const blob = new Blob([toCsv(intel)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chemichemi-lake-victoria-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SiteNav />
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Brain className="size-3.5 text-primary" />
              On-device prediction model · runs offline
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Lake intelligence</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Water quality index, contamination probability and pollution hotspots across 27 monitored beaches in five
              Kenyan counties — a shared evidence base for BMUs, county water offices and researchers.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={download} disabled={!intel.length}>
            <Download className="size-4" />
            Export open data (CSV)
          </Button>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card className="surface-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <Droplets className="size-4" /> Lake-wide WQI
              </div>
              <div className={cn("mt-2 font-display text-3xl font-bold", wqiTone(avgWqi))}>{avgWqi}/100</div>
              <Progress value={avgWqi} className="mt-3" />
            </CardContent>
          </Card>
          <Card className="surface-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <TriangleAlert className="size-4" /> Beaches on alert
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-danger">{alerts}</div>
              <p className="mt-3 text-xs text-muted-foreground">Danger or critical risk today</p>
            </CardContent>
          </Card>
          <Card className="surface-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <TrendingUp className="size-4" /> Highest 72h risk
              </div>
              <div className="mt-2 font-display text-xl font-bold">{top?.location.name ?? "—"}</div>
              <p className={cn("mt-1 text-sm font-semibold", top ? probTone(top.prediction.probability) : "")}>
                {top ? `${Math.round(top.prediction.probability * 100)}% event probability` : "Loading…"}
              </p>
            </CardContent>
          </Card>
        </div>

        <h2 className="mt-10 font-display text-lg font-bold">County pollution pressure</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {counties.map((c) => (
            <Card key={c.county} className="surface-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    {c.county}
                  </span>
                  <span className={cn("font-display text-lg", wqiTone(c.avgWqi))}>{c.avgWqi}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <Progress value={c.avgWqi} />
                <p>
                  {c.beaches} beaches · {c.alerts} on alert
                </p>
                <p>
                  Hotspot: <span className="font-semibold text-foreground">{c.worst.location.name}</span> (
                  {Math.round(c.worst.prediction.probability * 100)}% 72h)
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {top && (
          <Card className="surface-card mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="size-4 text-primary" />
                Why the model flags {top.location.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {top.prediction.drivers.map((d) => (
                <div key={d.label} className="rounded-xl border border-border bg-secondary/30 p-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>{d.label}</span>
                    <span className="text-muted-foreground">+{d.contribution.toFixed(2)} logit</span>
                  </div>
                  <Progress className="mt-2" value={Math.min(100, d.contribution * 25)} />
                </div>
              ))}
              <p className="text-xs text-muted-foreground sm:col-span-2">
                Model confidence {Math.round(top.prediction.confidence * 100)}% · explainable logistic regression, no
                network call required.
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="surface-card mt-8 mb-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="size-4 text-primary" />
              All monitored beaches
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beach</TableHead>
                    <TableHead>County</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead className="text-right">WQI</TableHead>
                    <TableHead className="text-right">72h event</TableHead>
                    <TableHead className="text-right">Reports</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {intel.map((i) => (
                    <TableRow key={i.location.id}>
                      <TableCell className="font-medium">{i.location.name}</TableCell>
                      <TableCell className="text-muted-foreground">{i.location.county}</TableCell>
                      <TableCell>
                        <RiskPill level={i.level} />
                      </TableCell>
                      <TableCell className={cn("text-right font-semibold", wqiTone(i.quality.wqi))}>
                        {i.quality.wqi}
                      </TableCell>
                      <TableCell className={cn("text-right font-semibold", probTone(i.prediction.probability))}>
                        {Math.round(i.prediction.probability * 100)}%
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{i.reports}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
