import { dayjs } from "#shared/services/dayjs";

export const AUTOSAVE_INTERVAL = dayjs.duration(60, "seconds").asMilliseconds();
export const FPS = 60;
