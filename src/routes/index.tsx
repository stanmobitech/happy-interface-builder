import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CloudRain,
  Droplets,
  Fish,
  Gauge,
  MapPin,
  ShieldCheck,
  Thermometer,
  Wind,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RiskGauge, RiskPill, severityStyles } from "@/components/risk";
import { cn } from "@/lib/utils";
import {
  assessRisk,
  DEMO_WEATHER,
  generateWeather,
  getForecast,
  kenyanBeaches,
  type Location,
} from "@/lib/chemichemi";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chemichemi — Lake Victoria Fish Kill Early Warning" },
      {
        name: "description",
        content:
          "Daily oxygen-crash and pollution risk forecasts for 27 Kenyan Lake Victoria fishing beaches, built for cage and beach seine farmers.",
      },
      { property: "og:title", content: "Chemichemi — Lake Victoria Fish Kill Early Warning" },
      {
        property: "og:description",
        content: "Beach-level risk scores, 7-day forecasts and community pollution reports for Lake Victoria fish farmers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const counties = Array.from(new Set(kenyanBeaches.map((b) => b.county)));

function Metric({ icon: Icon, label, value, unit }: { icon: typeof Wind; label: string; value: number; unit: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-bold">
        {value}
        <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function Dashboard() {
  const [locationId, setLocationId] = useState<number>(7);
  const [demo, setDemo] = useState(false);

  const location = useMemo(
    () => kenyanBeaches.find((b) => b.id === locationId) as Location,
    [locationId],
  );

  const weather = useMemo(() => {
    const live = generateWeather(location.lat, location.lon, 0);
    return demo ? { ...live, ...DEMO_WEATHER } : live;
  }, [location, demo]);

  const assessment = useMemo(() => assessRisk(weather, location), [weather, location]);
  const forecast = useMemo(() => getForecast(location), [location]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-xl border border-primary/30 bg-primary/15">
            <Droplets className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight">Chemichemi</h1>
            <p className="text-xs text-muted-foreground">Lake Victoria fish farmer protector</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={demo ? "default" : "outline"} size="sm" onClick={() => setDemo((d) => !d)}>
            <Zap className="size-4" />
            {demo ? "Demo active" : "Simulate fish kill"}
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link to="/reports">
              Community reports
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="mt-10 max-w-2xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Activity className="size-3.5 text-primary" />
          27 beaches · Kisumu · Homa Bay · Siaya · Busia · Migori
        </p>
        <h2 className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
          Know before the <span className="text-gradient-signal">oxygen crashes</span>
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Chemichemi combines temperature, wind mixing, rainfall runoff and local beach conditions into one daily risk
          score so cage and beach seine farmers can act before a fish kill.
        </p>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={String(locationId)} onValueChange={(v) => setLocationId(Number(v))}>
          <SelectTrigger className="w-full sm:w-80">
            <SelectValue placeholder="Select your beach" />
          </SelectTrigger>
          <SelectContent>
            {counties.map((county) => (
              <SelectGroup key={county}>
                <SelectLabel>{county}</SelectLabel>
                {kenyanBeaches
                  .filter((b) => b.county === county)
                  .map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5" />
          {location.lat.toFixed(4)}, {location.lon.toFixed(4)} · {location.description}
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="surface-card lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="font-display text-2xl">{location.name}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{location.county} County</p>
            </div>
            <RiskPill level={assessment.level} />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <RiskGauge score={assessment.score} level={assessment.level} />
              <div className="flex-1">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Metric icon={Thermometer} label="Surface temp" value={weather.temperature} unit="°C" />
                  <Metric icon={Wind} label="Wind" value={weather.windspeed} unit="m/s" />
                  <Metric icon={CloudRain} label="Rainfall" value={weather.precipitation} unit="mm" />
                </div>
                <div
                  className={cn(
                    "mt-4 rounded-xl border p-4 text-sm font-medium leading-relaxed",
                    severityStyles[
                      assessment.level === "SAFE"
                        ? "low"
                        : assessment.level === "CAUTION"
                          ? "moderate"
                          : assessment.level === "DANGER"
                            ? "high"
                            : "critical"
                    ],
                  )}
                >
                  {assessment.advice}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="size-4 text-primary" />
              Risk factors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assessment.factors.map((f) => (
              <div key={f.name} className="rounded-xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{f.name}</span>
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                      severityStyles[f.severity],
                    )}
                  >
                    {f.severity}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="surface-card mt-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Fish className="size-4 text-primary" />
            7-day outlook
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {forecast.map(({ weather: w, assessment: a }) => (
              <div key={w.date.toISOString()} className="rounded-xl border border-border bg-secondary/30 p-3">
                <div className="text-xs font-semibold text-muted-foreground">
                  {w.date.toLocaleDateString("en-KE", { weekday: "short", month: "short", day: "numeric" })}
                </div>
                <RiskPill level={a.level} className="mt-2" />
                <dl className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <dt>Temp</dt>
                    <dd className="font-medium text-foreground">{w.temperature}°C</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Wind</dt>
                    <dd className="font-medium text-foreground">{w.windspeed} m/s</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Rain</dt>
                    <dd className="font-medium text-foreground">{w.precipitation} mm</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Separator className="my-10" />

      <footer className="flex flex-wrap items-center justify-between gap-3 pb-6 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-primary" />
          Community reports secured on a tamper-evident hash ledger
        </span>
        <span>Chemichemi · Built for Kenyan BMUs on Lake Victoria</span>
      </footer>
    </div>
  );
}
