import type { AzureFunction } from "@/models/azure/function/AzureFunction";
import type { EventGridEventInput } from "@/models/azure/eventGrid/EventGridEventInput";

import { EVENT_GRID_DATA_VERSION } from "@/services/azure/eventGrid/constants";
// The envelope every publisher sends. Publishers differ only in event type, subject and payload, so those are the
// Arguments and the rest of the shape — including the schema version every event in this system carries — is stated
// Once here. Generic over the payload so the call site keeps its exact data type rather than widening to unknown.
// `id` is left to Event Grid, which assigns one; the replay function is the sole publisher that sets it, because it
// Carries its attempt counter there.
export const createEventGridEvent = <TData>(
  eventType: AzureFunction,
  subject: string,
  data: TData,
): Omit<EventGridEventInput<TData>, "id"> => ({
  data,
  dataVersion: EVENT_GRID_DATA_VERSION,
  eventType,
  subject,
});
