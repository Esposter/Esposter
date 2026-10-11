import type { FillKind } from "#src/models/fleet/FillKind";

// What a machine is, as `~/.esposter/machine.json` holds it: the id it claims under, the areas the user lent it for,
// The capabilities its entries' needs are met by, and its share of the fleet's fill: the live claims it keeps and the kinds
export interface MachineProfile {
  areas: string[];
  capabilities: string[];
  fillKinds?: FillKind[];
  fillTarget?: number;
  id: string;
}
