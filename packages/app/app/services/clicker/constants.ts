import { DAY, MINUTE, SECOND } from "@esposter/shared";

export const AUTOSAVE_INTERVAL = 60 * SECOND;
export const BUY_QUANTITIES = [1, 10, 100] as const;
export const FPS = 60;
export const GAME_TICK_INTERVAL = SECOND / FPS;
// Offline progress: production while away is capped and awarded at a reduced rate
// So active play stays strictly better than idling offline.
export const MIN_OFFLINE_DIALOG_ELAPSED = MINUTE;
export const OFFLINE_CAP = DAY;
export const OFFLINE_RATE = 0.5;
export const PRICE_GROWTH = 1.15;
