import type { Locomotion } from "genshin-engine";

import { BodyType } from "#src/models/character/BodyType";
import { PROVISIONAL_LOCOMOTION } from "#src/services/world/locomotion/constants";

// How each body type moves, since how far its characters sprint and jump differs by body: a type takes its own entry
// Once its clips and recordings are measured, never another type's, and moves by the provisional movement until then
export const BodyTypeLocomotionMap = {
  [BodyType.MediumFemale]: PROVISIONAL_LOCOMOTION,
  [BodyType.MediumMale]: PROVISIONAL_LOCOMOTION,
  [BodyType.ShortFemale]: PROVISIONAL_LOCOMOTION,
  [BodyType.TallFemale]: PROVISIONAL_LOCOMOTION,
  [BodyType.TallMale]: PROVISIONAL_LOCOMOTION,
} as const satisfies Record<BodyType, Locomotion>;
