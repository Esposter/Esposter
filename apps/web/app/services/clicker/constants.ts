export const AUTOSAVE_INTERVAL_MS = Temporal.Duration.from({ seconds: 60 }).total("milliseconds");
export const BUY_QUANTITIES = [1, 10, 100] as const;
export const FPS = 60;
export const GAME_TICK_INTERVAL_MS = Temporal.Duration.from({ seconds: 1 }).total("milliseconds") / FPS;
// An item's details open away from the drawer it is listed in: the inventory is on the right, the store on the left
export const INVENTORY_ITEM_POSITION_AREA = "left span-bottom";
// Offline progress: production while away is capped and awarded at a reduced rate
// So active play stays strictly better than idling offline.
export const MIN_OFFLINE_DIALOG_ELAPSED_MS = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
export const OFFLINE_CAP_MS = Temporal.Duration.from({ days: 1 }).total("milliseconds");
export const OFFLINE_RATE = 0.5;
export const PRICE_GROWTH = 1.15;
// How long a click popup animates for, which is also when the store removes it
export const POPUP_DURATION_MS = Temporal.Duration.from({ seconds: 10 }).total("milliseconds");
export const STORE_ITEM_POSITION_AREA = "right span-bottom";
