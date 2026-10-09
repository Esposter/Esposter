import { QualityTier } from "genshin-engine";

// The tier the world renders at, which sets its pixel ratio, shadows, grass and post passes
export const GENSHIN_QUALITY_TIER = QualityTier.High;

// The start is retried with backoff while the account's save cannot be leased, doubling from the base to the cap
export const GENSHIN_START_RETRY_BASE_DELAY_MS = 1000;
export const GENSHIN_START_RETRY_MAX_DELAY_MS = 30_000;
