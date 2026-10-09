import type { GcgCostSubject } from "#src/models/gcg/GcgCostSubject";

// Whether a cost is a character's switch: paid for neither a card played nor a skill used
export const checkIsGcgSwitchCost = (subject: GcgCostSubject): boolean =>
  subject.card === undefined && subject.skill === undefined;
