import type { Except } from "type-fest";

// A destination as the Event Grid REST body spells it: the endpoint type beside a `properties` bag holding what the
// Pulumi args flatten onto the destination itself
export type NestedEndpointDestination<TDestination extends { endpointType: unknown }> = Pick<
  TDestination,
  "endpointType"
> & { properties: Except<TDestination, "endpointType"> };
