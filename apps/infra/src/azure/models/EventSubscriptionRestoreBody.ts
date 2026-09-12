import type { AzureFunctionEventSubscriptionArguments } from "#src/azure/models/AzureFunctionEventSubscriptionArguments";
import type { NestedEndpointDestination } from "#src/azure/models/NestedEndpointDestination";
import type * as pulumi from "@pulumi/pulumi";
import type { Except } from "type-fest";

// The PUT body a restore workflow recreates an event subscription with (getEventSubscriptionBody)
export interface EventSubscriptionRestoreBody {
  properties: Except<AzureFunctionEventSubscriptionArguments, "deadLetterDestination" | "destination"> & {
    deadLetterDestination: NestedEndpointDestination<AzureFunctionEventSubscriptionArguments["deadLetterDestination"]>;
    destination: NestedEndpointDestination<AzureFunctionEventSubscriptionArguments["destination"]>;
    id: pulumi.Output<string>;
    name: pulumi.Output<string>;
    resourceGroup: pulumi.Output<string>;
    topic: pulumi.Output<string>;
    type: "Microsoft.EventGrid/eventSubscriptions";
  };
}
