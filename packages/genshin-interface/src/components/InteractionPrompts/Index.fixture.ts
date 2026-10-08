import { InteractionKind } from "#src/models/InteractionKind";

// The English PC client's pickup at 1080 high, three Sunsettia and Matsutake rows in reach with the first selected, as
// The public tutorial's recording at 15 seconds shows them
export const props = {
  prompts: [
    { id: "0", kind: InteractionKind.PickUp, name: "Sunsettia" },
    { id: "1", kind: InteractionKind.PickUp, name: "Matsutake" },
    { id: "2", kind: InteractionKind.PickUp, name: "Sunsettia" },
  ],
  selectedId: "0",
};
