import { GENSHIN_START_RETRY_BASE_DELAY_MS, GENSHIN_START_RETRY_MAX_DELAY_MS } from "@/services/genshin/constants";

// The wait before the start's next attempt, doubling with each failed attempt and held at the cap
export const getGenshinStartRetryDelayMs = (attempt: number) =>
  Math.min(GENSHIN_START_RETRY_BASE_DELAY_MS * 2 ** attempt, GENSHIN_START_RETRY_MAX_DELAY_MS);
