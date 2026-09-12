import type { AzureFunctionEventSubscriptionArguments } from "#src/azure/models/AzureFunctionEventSubscriptionArguments";
import type { NestedEndpointDestination } from "#src/azure/models/NestedEndpointDestination";
import type { Except } from "type-fest";

// The PUT body a restore workflow recreates an event subscription with (getEventSubscriptionBody). Only the
// Writable subscription settings go under `properties` — the ARM envelope (id, name, type) and the topic are
// The request's path, and Event Grid's contract does not list them as properties
export interface EventSubscriptionRestoreBody {
  properties: Except<AzureFunctionEventSubscriptionArguments, "deadLetterDestination" | "destination"> & {
    deadLetterDestination: NestedEndpointDestination<AzureFunctionEventSubscriptionArguments["deadLetterDestination"]>;
    destination: NestedEndpointDestination<AzureFunctionEventSubscriptionArguments["destination"]>;
  };
}
