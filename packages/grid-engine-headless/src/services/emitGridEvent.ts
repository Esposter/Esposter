import type { GridEngineEvents } from "#src/models/GridEngineEvents";
import type { GridEngineState } from "#src/models/GridEngineState";

// Every listener subscribed to the event hears the raise, each one left subscribed until it unsubscribes
export const emitGridEvent = <TEvent extends keyof GridEngineEvents>(
  state: GridEngineState,
  event: TEvent,
  payload: GridEngineEvents[TEvent],
): void => {
  for (const listener of state.listeners[event]) listener(payload);
};
