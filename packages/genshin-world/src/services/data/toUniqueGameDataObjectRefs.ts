import type { GameDataObjectRef } from "#src/models/data/GameDataObjectRef";

import { ID_SEPARATOR } from "@esposter/shared";

// One ref per stored object, the first ref that names it kept, so an object named twice is fetched or read once
export const toUniqueGameDataObjectRefs = (refs: GameDataObjectRef[]): GameDataObjectRef[] => [
  ...new Map(refs.map((ref) => [`${ref.dataset}${ID_SEPARATOR}${ref.hash}`, ref] as const)).values(),
];
