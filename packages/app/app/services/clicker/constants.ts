import { dayjs } from "#shared/services/dayjs";

export const AUTOSAVE_INTERVAL = dayjs.duration(60, "seconds").asMilliseconds();
export const BUY_QUANTITIES = [1, 10, 100] as const;
export const FPS = 60;
// Offline progress: production while away is capped and awarded at a reduced rate
// So active play stays strictly better than idling offline.
export const MIN_OFFLINE_DIALOG_ELAPSED = dayjs.duration(1, "minute").asMilliseconds();
export const OFFLINE_CAP = dayjs.duration(1, "day").asMilliseconds();
export const OFFLINE_RATE = 0.5;
export const PRICE_GROWTH = 1.15;
