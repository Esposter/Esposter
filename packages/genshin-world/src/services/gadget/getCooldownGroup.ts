import type { GadgetRow } from "#src/models/gadget/GadgetRow";

// The group a gadget's cooldown is kept under: its own group the config gives, shared with the gadgets of that group, or
// Its own id when the config gives none, so a gadget with no group shares its cooldown with no other. The game's groups
// Are small numbers and the ids are not, so the two never meet in the map
export const getCooldownGroup = (gadget: GadgetRow): number =>
  gadget.cooldownGroup === 0 ? gadget.id : gadget.cooldownGroup;
