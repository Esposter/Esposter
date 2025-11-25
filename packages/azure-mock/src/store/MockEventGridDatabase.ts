import type { EventGridEvent } from "@azure/eventgrid";
// Map<endpoint, Array<EventGridEvent<unknown>>>
export const MockEventGridDatabase: Map<string, EventGridEvent<unknown>[]> = new Map<
  string,
  EventGridEvent<unknown>[]
>();
