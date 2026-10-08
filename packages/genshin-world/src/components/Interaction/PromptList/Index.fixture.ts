import { InteractionKind } from "genshin-interface";

// The English PC client's pickup at 1080 high, three Sunsettia and Matsutake drops in reach with the first selected, as
// The public tutorial's recording at 15 seconds shows them
const POSITION = { x: 0, y: 0, z: 0 };

export const props = {
  interactionPrompts: {
    interactables: [
      { id: "0", kind: InteractionKind.PickUp, name: "Sunsettia", position: POSITION },
      { id: "1", kind: InteractionKind.PickUp, name: "Matsutake", position: POSITION },
      { id: "2", kind: InteractionKind.PickUp, name: "Sunsettia", position: POSITION },
    ],
    selectedId: "0",
    windowStart: 0,
  },
};
