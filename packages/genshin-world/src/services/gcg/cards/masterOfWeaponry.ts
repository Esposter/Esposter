import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { createGcgEquipmentShift } from "#src/services/gcg/effects/shiftGcgEquipment";

// Master of Weaponry: a weapon equipped to one of the side's characters moves to another of its characters of the same
// Weapon type
export const masterOfWeaponry = createGcgEquipmentShift(GcgCardKind.Weapon);
