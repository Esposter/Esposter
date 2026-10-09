import { GcgCardKind } from "#src/models/gcg/GcgCardKind";
import { createGcgEquipmentShift } from "#src/services/gcg/effects/shiftGcgEquipment";

// Blessing of the Divine Relic's Installation: an artifact equipped to one of the side's characters moves to another
export const blessingOfTheDivineRelicsInstallation = createGcgEquipmentShift(GcgCardKind.Artifact);
