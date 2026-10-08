import { AmplifyingReactionType } from "#src/models/combat/AmplifyingReactionType";
import { CatalyzeReactionType } from "#src/models/combat/CatalyzeReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { mergeObjectsStrict } from "@esposter/shared";

// The reactions that deal no damage: Crystallize drops a shard, Frozen freezes the target, and Quicken leaves its aura
enum BaseReactionType {
  Crystallize = "Crystallize",
  Frozen = "Frozen",
  Quicken = "Quicken",
}

// Every reaction two elements trigger
export const ReactionType = mergeObjectsStrict(
  AmplifyingReactionType,
  BaseReactionType,
  CatalyzeReactionType,
  TransformativeReactionType,
);
export type ReactionType =
  | AmplifyingReactionType
  | BaseReactionType
  | CatalyzeReactionType
  | TransformativeReactionType;
