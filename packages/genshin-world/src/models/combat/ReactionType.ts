import { AmplifyingReactionType } from "#src/models/combat/AmplifyingReactionType";
import { CatalyzeReactionType } from "#src/models/combat/CatalyzeReactionType";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { mergeObjectsStrict } from "@esposter/shared";

// The reactions that deal no damage: Crystallize drops a shard, Frozen freezes the target, and Quicken leaves its aura
enum BaseReactionType {
  Crystallize = "Crystallize",
  Frozen = "Frozen",
  Quicken = "Quicken",
}

// Every reaction two elements trigger, the Lunar and Stellar ones a party turns them into among them
export const ReactionType = mergeObjectsStrict(
  AmplifyingReactionType,
  BaseReactionType,
  CatalyzeReactionType,
  LunarReactionType,
  StellarReactionType,
  TransformativeReactionType,
);
export type ReactionType =
  | AmplifyingReactionType
  | BaseReactionType
  | CatalyzeReactionType
  | LunarReactionType
  | StellarReactionType
  | TransformativeReactionType;
