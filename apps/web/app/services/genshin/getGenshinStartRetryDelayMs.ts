import { GENSHIN_START_RETRY_BASE_DELAY_MS, GENSHIN_START_RETRY_MAX_DELAY_MS } from "@/services/genshin/constants";
import { getExponentialBackoffDelayMs } from "@esposter/shared";

// The wait before the start's next attempt, doubling with each failed attempt and held at the cap
export const getGenshinStartRetryDelayMs = (attempt: number) =>
  getExponentialBackoffDelayMs(attempt, GENSHIN_START_RETRY_BASE_DELAY_MS, GENSHIN_START_RETRY_MAX_DELAY_MS);
