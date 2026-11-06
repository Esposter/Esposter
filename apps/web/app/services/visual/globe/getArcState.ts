import { GlobeConfiguration } from "@/services/visual/GlobeConfiguration";

const { arcGrowTime, arcHoldTime, arcStagger } = GlobeConfiguration;
const period = 2 * arcGrowTime + arcHoldTime;
const pulseTime = arcHoldTime + arcGrowTime;
const smoothstep = (x: number) => x * x * (3 - 2 * x);

// One arc's cycle as fractions of its tube: it grows out of its start, holds, then is drawn away from its start. A
// Ring pulses at its end from the moment it lands, and each order of arcs waits one stagger longer than the one before
export const getArcState = (elapsed: number, order: number) => {
  const delayed = elapsed - order * arcStagger;
  if (delayed < 0) return { end: 0, pulseOpacity: 0, pulseScale: 0, start: 0 };
  const time = delayed % period;
  const sinceLanding = time - arcGrowTime;
  const pulseProgress = sinceLanding < 0 ? 1 : Math.min(1, sinceLanding / pulseTime);
  const pulse =
    sinceLanding < 0
      ? { pulseOpacity: 0, pulseScale: 0 }
      : { pulseOpacity: 1 - pulseProgress, pulseScale: 1 - Math.exp(-3 * pulseProgress) };
  if (time < arcGrowTime) return { end: smoothstep(time / arcGrowTime), start: 0, ...pulse };
  if (time < arcGrowTime + arcHoldTime) return { end: 1, start: 0, ...pulse };
  return { end: 1, start: smoothstep((time - arcGrowTime - arcHoldTime) / arcGrowTime), ...pulse };
};
