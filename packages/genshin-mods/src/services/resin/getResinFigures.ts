import type { SessionUsage } from "claude-code";

import type { ResinFigure } from "../../models/ResinFigure";

import { CACHE_LOW_MS, USAGE_WARNING_PERCENTAGE } from "../constants";
import { getCacheRemainingMs } from "./getCacheRemainingMs";

const tokenFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 1, notation: "compact" });
const costFormat = new Intl.NumberFormat("en", { currency: "USD", style: "currency" });
const minuteFormat = new Intl.NumberFormat("en", { style: "unit", unit: "minute", unitDisplay: "narrow" });
const RateLimitLabelMap: Record<string, string> = { five_hour: "5h", seven_day: "7d" };

// The row's figures in the order they are read: the cache only once a reply has started its clock, and each other
// Figure only once the engine has a reading, since a zero it never measured would read as a fact
export const getResinFigures = (
  { context, cost, rateLimits }: Pick<SessionUsage, "context" | "cost" | "rateLimits">,
  lastResponseAt: number,
  now: number,
): ResinFigure[] => {
  const figures: ResinFigure[] = [];
  if (lastResponseAt > 0) {
    const remainingMs = getCacheRemainingMs(lastResponseAt, now);
    const remainingMinutes = Math.ceil(Temporal.Duration.from({ milliseconds: remainingMs }).total("minutes"));
    const remaining = remainingMs > 0 ? minuteFormat.format(remainingMinutes) : "cold";
    const resend = context.tokens === undefined ? "" : ` · re-sends ${tokenFormat.format(context.tokens)}`;
    figures.push({ isWarning: remainingMs < CACHE_LOW_MS, label: "cache", text: `${remaining}${resend}` });
  }

  if (context.tokens !== undefined)
    figures.push({
      isWarning: (context.percent ?? 0) >= USAGE_WARNING_PERCENTAGE,
      label: "context",
      text: `${tokenFormat.format(context.tokens)}/${tokenFormat.format(context.window)}`,
    });

  for (const { kind, percentUsed } of rateLimits)
    figures.push({
      isWarning: percentUsed >= USAGE_WARNING_PERCENTAGE,
      label: RateLimitLabelMap[kind] ?? kind,
      text: `${Math.round(percentUsed)}%`,
    });

  if (cost) figures.push({ isWarning: false, label: "cost", text: costFormat.format(cost.usd) });
  return figures;
};
