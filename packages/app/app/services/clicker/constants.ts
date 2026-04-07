import { dayjs } from "#shared/services/dayjs";

export const CLICKER_LOCAL_STORAGE_KEY = "clicker-store";
export const AUTOSAVE_INTERVAL = dayjs.duration(60, "seconds").asMilliseconds();
export const FPS = 60;
