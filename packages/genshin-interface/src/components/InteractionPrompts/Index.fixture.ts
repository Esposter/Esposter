import { InteractionKind } from "#src/models/InteractionKind";

// A chest, a flower and a character in reach, the flower selected
export const props = {
  prompts: [
    { id: "0", kind: InteractionKind.Open, name: "Common Chest" },
    { id: "1", kind: InteractionKind.PickUp, name: "Windwheel Aster" },
    { id: "2", kind: InteractionKind.Talk, name: "Amber" },
  ],
  selectedId: "1",
};
