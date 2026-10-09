// What a machine is, as `~/.esposter/machine.json` holds it: the id it claims under, the areas the user lent it for,
// And the capabilities its entries' needs are met by
export interface MachineProfile {
  areas: string[];
  capabilities: string[];
  id: string;
}
