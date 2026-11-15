export const TimerMethod = {
  ClearInterval: "clearInterval",
  ClearTimeout: "clearTimeout",
  SetInterval: "setInterval",
  SetTimeout: "setTimeout",
} as const;
export type TimerMethod = (typeof TimerMethod)[keyof typeof TimerMethod];
