import { dayjs } from "#shared/services/dayjs";

export const AUTOSAVE_INTERVAL = dayjs.duration(60, "seconds").asMilliseconds();
export const FPS = 60;
export const PRICE_GROWTH = 1.15;
