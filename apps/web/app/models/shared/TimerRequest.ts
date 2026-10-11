import type { TimerMethod } from "@/models/shared/TimerMethod";

export type TimerRequest =
  | { delayMs: number; id: number; method: TimerMethod.SetInterval | TimerMethod.SetTimeout }
  | { id: number; method: TimerMethod.ClearInterval | TimerMethod.ClearTimeout };
