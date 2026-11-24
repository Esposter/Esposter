import type { GridEngineState } from "#src/internal/models/GridEngineState";
import type { GridEngineEvents } from "#src/models/GridEngineEvents";

// A listener stays subscribed until the function returned here is called.
// Each subscription is its own entry, so a function subscribed twice is heard twice.
// The first unsubscribe leaves the second in place.
export const addListener = <TEvent extends keyof GridEngineEvents>(
  state: GridEngineState,
  event: TEvent,
  listener: (payload: GridEngineEvents[TEvent]) => void,
): (() => void) => {
  const listeners = state.listeners[event];
  const subscription = (payload: GridEngineEvents[TEvent]) => {
    listener(payload);
  };
  listeners.add(subscription);
  return () => {
    listeners.delete(subscription);
  };
};
