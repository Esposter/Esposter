export const AUTOSAVE_INTERVAL_MS = Temporal.Duration.from({ seconds: 60 }).total("milliseconds");
export const BUY_QUANTITIES = [1, 10, 100] as const;
export const FPS = 60;
export const GAME_TICK_INTERVAL_MS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds") / FPS;
// Offline progress: production while away is capped and awarded at a reduced rate
// So active play stays strictly better than idling offline.
export const MIN_OFFLINE_DIALOG_ELAPSED_MS = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
export const OFFLINE_CAP_MS = Temporal.Duration.from({ days: 1 }).total("milliseconds");
export const OFFLINE_RATE = 0.5;
export const PRICE_GROWTH = 1.15;
