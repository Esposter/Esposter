import type { GridEngineState } from "#src/internal/models/GridEngineState";
import type { GridEngineEvents } from "#src/models/GridEngineEvents";

// A listener stays subscribed until the function returned here is called
export const addListener = <TEvent extends keyof GridEngineEvents>(
  state: GridEngineState,
  event: TEvent,
  listener: (payload: GridEngineEvents[TEvent]) => void,
): (() => void) => {
  const listeners = state.listeners[event];
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
