import type { WorldEventMap } from "#src/models/world/WorldEventMap";

// The one emitter a world screen holds, typed by its WorldEventMap
export interface WorldEvents {
  emit: <K extends keyof WorldEventMap>(eventName: K, ...payload: WorldEventMap[K]) => void;
  on: <K extends keyof WorldEventMap>(eventName: K, listener: (...payload: WorldEventMap[K]) => void) => void;
}
