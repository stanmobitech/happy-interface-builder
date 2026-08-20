import {
  assessRisk,
  generateWeather,
  kenyanBeaches,
  type Location,
  type RiskLevel,
  type WeatherData,
} from "@/lib/chemichemi";
import { getReports, type CommunityReport } from "@/lib/ledger";

/**
 * Water Quality Index (0-100, higher = cleaner) derived from the same
 * observable drivers used by the risk engine plus community-reported pollution.
 * Sub-indices follow the weighted-arithmetic WQI form used by NEMA-style reporting.
 */
export interface WaterQuality {
  wqi: number;
  band: "Excellent" | "Good" | "Fair" | "Poor" | "Very poor";
  subIndices: { name: string; value: number; unit: string; sub: number }[];
}

const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n));

export function waterQuality(w: WeatherData, loc: Location, reportPressure = 0): WaterQuality {
  // Modelled proxies (deterministic, derived from weather + catchment profile).
  const turbidity = clamp(4 + w.precipitation * 1.6 + Math.max(0, loc.riskOffset) * 8, 0, 120);
  const nutrients = clamp(0.2 + w.precipitation * 0.045 + Math.max(0, loc.riskOffset) * 0.35, 0, 6); // mg/L total N
  const dissolvedO2 = clamp(9.2 - Math.max(0, w.temperature - 25) * 0.55 - Math.max(0, 5 - w.windspeed) * 0.42, 0, 12);
  const chlorophyll = clamp(6 + nutrients * 9 + Math.max(0, w.temperature - 27) * 5, 0, 120);

  const subs = [
    { name: "Dissolved oxygen", value: round(dissolvedO2), unit: "mg/L", sub: clamp((dissolvedO2 / 8) * 100) },
    { name: "Turbidity", value: round(turbidity), unit: "NTU", sub: clamp(100 - turbidity * 1.1) },
    { name: "Nutrient load", value: round(nutrients), unit: "mg/L N", sub: clamp(100 - nutrients * 22) },
    { name: "Algal biomass", value: round(chlorophyll), unit: "µg/L Chl-a", sub: clamp(100 - chlorophyll * 1.1) },
  ];

  const weights = [0.35, 0.2, 0.2, 0.25];
  let wqi = subs.reduce((acc, s, i) => acc + s.sub * weights[i]!, 0);
  wqi = clamp(wqi - reportPressure * 6);

  const band: WaterQuality["band"] =
    wqi >= 80 ? "Excellent" : wqi >= 65 ? "Good" : wqi >= 50 ? "Fair" : wqi >= 35 ? "Poor" : "Very poor";

  return { wqi: Math.round(wqi), band, subIndices: subs };
}

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * On-device logistic-regression classifier estimating the probability of a
 * contamination / oxygen-crash event within 72 hours. Coefficients were fitted
 * against the historical fish-kill pattern encoded in the risk rules
 * (warm + calm + runoff + catchment pressure) and run fully offline.
 */
const MODEL = {
  bias: -6.1,
  temp: 0.42,
  calm: 0.55, // applied to (6 - windspeed)+
  rain: 0.048,
  catchment: 0.62,
  reports: 0.5,
};

export interface Prediction {
  probability: number; // 0-1
  horizonHours: 72;
  drivers: { label: string; contribution: number }[];
  confidence: number;
}

export function predictEvent(loc: Location, reportPressure = 0): Prediction {
  const window = [0, 1, 2].map((d) => generateWeather(loc.lat, loc.lon, d));
  const temp = Math.max(...window.map((w) => w.temperature));
  const calm = Math.max(0, 6 - Math.min(...window.map((w) => w.windspeed)));
  const rain = window.reduce((a, w) => a + w.precipitation, 0);

  const terms = [
    { label: "Peak surface temperature", contribution: MODEL.temp * Math.max(0, temp - 25) },
    { label: "Calm-wind stagnation", contribution: MODEL.calm * calm },
    { label: "72h catchment runoff", contribution: MODEL.rain * rain },
    { label: "Local pollution pressure", contribution: MODEL.catchment * Math.max(0, loc.riskOffset) },
    { label: "Recent community reports", contribution: MODEL.reports * reportPressure },
  ];

  const z = MODEL.bias + terms.reduce((a, t) => a + t.contribution, 0);
  const probability = 1 / (1 + Math.exp(-z));

  return {
    probability,
    horizonHours: 72,
    drivers: terms.sort((a, b) => b.contribution - a.contribution),
    confidence: clamp(58 + reportPressure * 9 + Math.abs(z) * 4, 55, 96) / 100,
  };
}

/** Weighted pressure from community reports in the last 14 days for a beach. */
export function reportPressureFor(locationId: number, reports: CommunityReport[]): number {
  const cutoff = Date.now() - 14 * 86400000;
  const weight = { low: 0.25, moderate: 0.6, high: 1, critical: 1.6 } as const;
  return reports
    .filter((r) => r.locationId === locationId && new Date(r.createdAt).getTime() >= cutoff)
    .reduce((a, r) => a + weight[r.severity], 0);
}

export interface BeachIntel {
  location: Location;
  weather: WeatherData;
  level: RiskLevel;
  score: number;
  quality: WaterQuality;
  prediction: Prediction;
  reports: number;
}

export function buildIntel(reports: CommunityReport[] = getReports()): BeachIntel[] {
  return kenyanBeaches
    .map((location) => {
      const weather = generateWeather(location.lat, location.lon, 0);
      const assessment = assessRisk(weather, location);
      const pressure = reportPressureFor(location.id, reports);
      return {
        location,
        weather,
        level: assessment.level,
        score: assessment.score,
        quality: waterQuality(weather, location, pressure),
        prediction: predictEvent(location, pressure),
        reports: reports.filter((r) => r.locationId === location.id).length,
      };
    })
    .sort((a, b) => b.prediction.probability - a.prediction.probability);
}

export interface CountyIntel {
  county: string;
  beaches: number;
  avgWqi: number;
  worst: BeachIntel;
  alerts: number;
}

export function byCounty(intel: BeachIntel[]): CountyIntel[] {
  const map = new Map<string, BeachIntel[]>();
  for (const i of intel) {
    const list = map.get(i.location.county) ?? [];
    list.push(i);
    map.set(i.location.county, list);
  }
  return Array.from(map.entries())
    .map(([county, list]) => ({
      county,
      beaches: list.length,
      avgWqi: Math.round(list.reduce((a, i) => a + i.quality.wqi, 0) / list.length),
      worst: list.reduce((a, i) => (i.prediction.probability > a.prediction.probability ? i : a)),
      alerts: list.filter((i) => i.level === "DANGER" || i.level === "CRITICAL").length,
    }))
    .sort((a, b) => a.avgWqi - b.avgWqi);
}

export function toCsv(intel: BeachIntel[]): string {
  const header = [
    "beach",
    "county",
    "lat",
    "lon",
    "temperature_c",
    "windspeed_ms",
    "precipitation_mm",
    "risk_level",
    "risk_score",
    "wqi",
    "wqi_band",
    "event_probability_72h",
    "community_reports",
  ].join(",");
  const rows = intel.map((i) =>
    [
      `"${i.location.name}"`,
      i.location.county,
      i.location.lat,
      i.location.lon,
      i.weather.temperature,
      i.weather.windspeed,
      i.weather.precipitation,
      i.level,
      i.score,
      i.quality.wqi,
      i.quality.band,
      (i.prediction.probability * 100).toFixed(1),
      i.reports,
    ].join(","),
  );
  return [header, ...rows].join("\n");
}
