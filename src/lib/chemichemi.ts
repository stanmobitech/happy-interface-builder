export type RiskLevel = "SAFE" | "CAUTION" | "DANGER" | "CRITICAL";

export interface Location {
  id: number;
  name: string;
  county: string;
  lat: number;
  lon: number;
  description: string;
  riskOffset: number;
}

export interface WeatherData {
  temperature: number;
  windspeed: number;
  precipitation: number;
  date: Date;
}

export interface RiskFactor {
  name: string;
  severity: "low" | "moderate" | "high" | "critical";
  description: string;
}

export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  maxScore: number;
  factors: RiskFactor[];
  advice: string;
}

export const kenyanBeaches: Location[] = [
  { id: 1, name: "Dunga Beach", county: "Kisumu", lat: -0.135, lon: 34.745, description: "Major fish landing site, cage farming nearby", riskOffset: 1 },
  { id: 2, name: "Kibos", county: "Kisumu", lat: -0.092, lon: 34.78, description: "River mouth fishing, cage culture zone", riskOffset: 1 },
  { id: 3, name: "Hippo Point", county: "Kisumu", lat: -0.145, lon: 34.74, description: "Tourism + fishing overlap", riskOffset: 0 },
  { id: 4, name: "Ogal Beach", county: "Kisumu", lat: -0.12, lon: 34.76, description: "Traditional fishing village", riskOffset: 0 },
  { id: 5, name: "Nyakach (Koru)", county: "Kisumu", lat: -0.35, lon: 34.95, description: "River Nyando mouth, heavy agricultural runoff", riskOffset: 1 },
  { id: 6, name: "Homa Bay Town Beach", county: "Homa Bay", lat: -0.5273, lon: 34.4571, description: "Major landing site, municipal pollution", riskOffset: 1 },
  { id: 7, name: "Mbita", county: "Homa Bay", lat: -0.4167, lon: 34.1333, description: "Rusinga Island channel, intensive cage farming", riskOffset: 2 },
  { id: 8, name: "Sindo", county: "Homa Bay", lat: -0.5, lon: 34.3, description: "Beach seine, shallow water algal bloom risk", riskOffset: 1 },
  { id: 9, name: "Nyandiwa", county: "Homa Bay", lat: -0.55, lon: 34.25, description: "Fishing camp, seasonal fish kills", riskOffset: 1 },
  { id: 10, name: "Lambwe", county: "Homa Bay", lat: -0.48, lon: 34.38, description: "Near river mouths, sedimentation", riskOffset: 0 },
  { id: 11, name: "Asembo Bay", county: "Homa Bay", lat: -0.43, lon: 34.15, description: "Cage farming cooperative area", riskOffset: 1 },
  { id: 12, name: "Usenge Beach", county: "Siaya", lat: 0.1, lon: 34.05, description: "Major landing beach, market center", riskOffset: 0 },
  { id: 13, name: "Uhanya Beach", county: "Siaya", lat: 0.08, lon: 34.03, description: "Traditional fishing, water hyacinth", riskOffset: 0 },
  { id: 14, name: "Uyoma", county: "Siaya", lat: 0.05, lon: 34.1, description: "Beach seine, community fishing", riskOffset: 0 },
  { id: 15, name: "Luanda Konyango", county: "Siaya", lat: 0.02, lon: 34.08, description: "Near Yala Swamp outflow", riskOffset: 1 },
  { id: 16, name: "Asembo", county: "Siaya", lat: 0.15, lon: 34.2, description: "Historical fishing village", riskOffset: 0 },
  { id: 17, name: "Port Victoria", county: "Busia", lat: 0.1333, lon: 33.9833, description: "Municipal + fishing, Nzoia River mouth", riskOffset: 1 },
  { id: 18, name: "Bunyala", county: "Busia", lat: 0.05, lon: 34.0, description: "Rice irrigation runoff, agrochemical input", riskOffset: 2 },
  { id: 19, name: "Budalangi", county: "Busia", lat: 0.1, lon: 34.05, description: "Flood-prone, seasonal pollution", riskOffset: 1 },
  { id: 20, name: "Sio Port", county: "Busia", lat: 0.12, lon: 34.02, description: "River Sio mouth, cross-border monitoring", riskOffset: 1 },
  { id: 21, name: "Sori Beach", county: "Migori", lat: -0.5833, lon: 34.1333, description: "Major fish landing, cage farming expansion", riskOffset: 1 },
  { id: 22, name: "Nyatike/Macalder", county: "Migori", lat: -0.95, lon: 34.3, description: "Gold mining runoff risk, heavy metals", riskOffset: 2 },
  { id: 23, name: "Kaler", county: "Migori", lat: -0.65, lon: 34.1, description: "Beach fishing, near river mouths", riskOffset: 0 },
  { id: 24, name: "Karungu", county: "Migori", lat: -0.85, lon: 34.2, description: "Traditional landing site", riskOffset: 0 },
  { id: 25, name: "Mfangano Island", county: "Homa Bay", lat: 0.45, lon: 34.05, description: "Island fishing, isolated water quality", riskOffset: -1 },
  { id: 26, name: "Rusinga Island", county: "Homa Bay", lat: -0.35, lon: 34.2, description: "Cage farming, erosion", riskOffset: 1 },
  { id: 27, name: "Takawiri Island", county: "Homa Bay", lat: 0.3, lon: 34.1, description: "Tourism + fishing, sensitive ecosystem", riskOffset: -1 },
];

/** Deterministic PRNG so a beach always shows a stable forecast for the day. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dayOfYear(d: Date) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function generateWeather(lat: number, lon: number, dayOffset: number): WeatherData {
  const now = new Date();
  now.setDate(now.getDate() + dayOffset);
  const doy = dayOfYear(now);
  const seed = Math.abs(lat * 10000 + lon * 100) + dayOffset * 12345 + doy;
  const r = mulberry32(Math.floor(seed));

  const seasonalTemp = 26 + 2.5 * Math.sin((2 * Math.PI * doy) / 365 - Math.PI / 3);
  let temp = seasonalTemp + r() * 3 - 1.5;
  temp = Math.min(31.5, Math.max(23, temp));

  let wind = 5 - (temp - 25) * 0.4 + r() * 4 - 2;
  wind = Math.min(14, Math.max(0.2, wind));

  const wet = (doy >= 60 && doy <= 150) || (doy >= 274 && doy <= 335);
  let precip = 0;
  if (wet) {
    precip = r() * 20;
    if (r() > 0.6) precip += r() * 35;
  } else if (r() > 0.85) {
    precip = r() * 10;
  }

  return {
    temperature: round1(temp),
    windspeed: round1(wind),
    precipitation: round1(precip),
    date: now,
  };
}

export function assessRisk(w: WeatherData, loc: Location): RiskAssessment {
  const factors: RiskFactor[] = [];
  let score = 0;

  if (w.temperature > 30) {
    score += 3;
    factors.push({ name: "Surface Temperature", severity: "critical", description: `${w.temperature}°C — Severe thermal stratification. Warm upper layers block oxygen exchange to cage depths (3–10m).` });
  } else if (w.temperature > 28) {
    score += 2;
    factors.push({ name: "Surface Temperature", severity: "high", description: `${w.temperature}°C — Strong stratification risk. Reduced vertical mixing expected.` });
  } else if (w.temperature > 25) {
    score += 1;
    factors.push({ name: "Surface Temperature", severity: "moderate", description: `${w.temperature}°C — Mild stratification possible. Monitor fish surfacing behaviour.` });
  } else {
    factors.push({ name: "Surface Temperature", severity: "low", description: `${w.temperature}°C — Favourable temperatures. Good potential for vertical oxygen mixing.` });
  }

  if (w.windspeed < 1.5) {
    score += 3;
    factors.push({ name: "Wind Speed", severity: "critical", description: `${w.windspeed} m/s — Dead calm. No surface mixing; oxygen depletion highly likely at dawn in cage areas.` });
  } else if (w.windspeed < 3) {
    score += 2;
    factors.push({ name: "Wind Speed", severity: "high", description: `${w.windspeed} m/s — Very low wind. Insufficient agitation for oxygen circulation to deep cages.` });
  } else if (w.windspeed < 5) {
    score += 1;
    factors.push({ name: "Wind Speed", severity: "moderate", description: `${w.windspeed} m/s — Reduced mixing. Monitor dissolved oxygen at dawn.` });
  } else {
    factors.push({ name: "Wind Speed", severity: "low", description: `${w.windspeed} m/s — Good wind mixing. Active surface agitation promoting oxygen exchange.` });
  }

  if (w.precipitation > 40) {
    score += 3;
    factors.push({ name: "Precipitation / Runoff", severity: "critical", description: `${w.precipitation}mm — Severe runoff. Nzoia/Yala/Nyando river flooding likely. Algal bloom + oxygen crash risk in 3–7 days.` });
  } else if (w.precipitation > 20) {
    score += 2;
    factors.push({ name: "Precipitation / Runoff", severity: "high", description: `${w.precipitation}mm — Significant agricultural runoff from sugarcane (Muhoroni), rice (Bunyala), tea (Kisii highlands).` });
  } else if (w.precipitation > 10) {
    score += 1;
    factors.push({ name: "Precipitation / Runoff", severity: "moderate", description: `${w.precipitation}mm — Elevated turbidity and nutrient input from surrounding watershed.` });
  } else {
    factors.push({ name: "Precipitation / Runoff", severity: "low", description: `${w.precipitation}mm — Minimal runoff impact. Stable watershed conditions.` });
  }

  if (loc.riskOffset > 0) {
    score += loc.riskOffset;
    factors.push({ name: "Location Risk", severity: "moderate", description: `${loc.name} has elevated baseline risk: ${loc.description}.` });
  } else if (loc.riskOffset < 0) {
    score += loc.riskOffset;
    factors.push({ name: "Location Benefit", severity: "low", description: `${loc.name} benefits from better natural circulation (deeper water / island exposure).` });
  }

  score = Math.min(10, Math.max(0, score));

  let level: RiskLevel;
  let advice: string;
  if (score >= 8) {
    level = "CRITICAL";
    advice = "CRITICAL: Move fish to surface cages or harvest immediately. Deploy aerators if available. Do not feed. Contact your BMU chairperson.";
  } else if (score >= 6) {
    level = "DANGER";
    advice = "DANGER: High mortality risk. Reduce cage density. Monitor every 2 hours from 4–8 AM. Prepare emergency harvest.";
  } else if (score >= 3) {
    level = "CAUTION";
    advice = "CAUTION: Conditions favour oxygen depletion. Watch for fish surfacing/gasping. Have aeration ready. Reduce feeding.";
  } else {
    level = "SAFE";
    advice = "SAFE: Conditions favourable. Maintain normal operations. Continue routine monitoring.";
  }

  return { level, score, maxScore: 10, factors, advice };
}

export const DEMO_WEATHER: Omit<WeatherData, "date"> = {
  temperature: 30.8,
  windspeed: 0.4,
  precipitation: 48,
};

export function getForecast(loc: Location) {
  return Array.from({ length: 7 }, (_, i) => {
    const w = generateWeather(loc.lat, loc.lon, i + 1);
    return { weather: w, assessment: assessRisk(w, loc) };
  });
}
