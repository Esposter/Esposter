import type { TimerMethod } from "@/models/shared/TimerMethod";

export type TimerRequest =
  | { delayMs: number; id: number; method: typeof TimerMethod.SetInterval | typeof TimerMethod.SetTimeout }
  | { id: number; method: typeof TimerMethod.ClearInterval | typeof TimerMethod.ClearTimeout };
