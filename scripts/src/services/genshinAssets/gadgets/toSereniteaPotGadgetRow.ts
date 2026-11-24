import type { GadgetRow } from "genshin-world";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The Serenitea Pot's gadget row, built from its item's row in the material table, the only row the game names it by:
// The widget config has no widget under its id. The pot is equipped to the gadget slot, so it is equipable. Its
// Placement caps are PROVISIONAL at one in the scene and one by the player, since the pot is unique and the bag
// Holds one. The caps are not in any table the dump has. The PC's gadget export or a recording of the pot's placement
// Settles them. Its use is an interaction rather than a timed quick use, so it names no cooldown
export const toSereniteaPotGadgetRow = (
  materialRows: readonly { id: number; materialType: string }[],
  itemId: number,
): GadgetRow => {
  const materialRow = materialRows.find(({ id }) => id === itemId);
  if (materialRow?.materialType !== "MATERIAL_WIDGET")
    throw new InvalidOperationError(Operation.Read, `material ${itemId}`, "has no widget material row");
  return {
    cooldownGroup: 0,
    cooldownOnFailSeconds: 0,
    cooldownSeconds: 0,
    gatherItemId: 0,
    id: itemId,
    isEquipable: true,
    kind: "Device",
    maxCountByPlayer: 1,
    maxCountInScene: 1,
    maxPoints: 0,
    region: "",
  };
};
