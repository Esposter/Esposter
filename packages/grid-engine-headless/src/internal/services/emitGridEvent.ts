import type { GridEngineState } from "#src/internal/models/GridEngineState";
import type { GridEngineEvents } from "#src/models/GridEngineEvents";

// Every listener subscribed when the event is raised hears it, each one left subscribed until it unsubscribes. The
// Listeners are read before the first one runs, so a listener subscribed during the raise hears the next raise, not
// This one
export const emitGridEvent = <TEvent extends keyof GridEngineEvents>(
  state: GridEngineState,
  event: TEvent,
  payload: GridEngineEvents[TEvent],
): void => {
  const listeners = [...state.listeners[event]];
  for (const listener of listeners) listener(payload);
};
