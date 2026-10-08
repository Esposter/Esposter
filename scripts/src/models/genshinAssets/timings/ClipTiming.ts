import type { ClipEvent } from "#src/models/genshinAssets/timings/ClipEvent";

// A clip's timing: its name, the seconds its span runs from its start to its stop, and the events it fires along it
export interface ClipTiming {
  duration: number;
  events: ClipEvent[];
  name: string;
}
