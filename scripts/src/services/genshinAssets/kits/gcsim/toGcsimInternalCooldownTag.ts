import { GCSIM_NO_INTERNAL_COOLDOWN_TAG } from "#src/services/genshinAssets/kits/constants";
import { GcsimInternalCooldownTagMap } from "#src/services/genshinAssets/kits/gcsim/GcsimInternalCooldownTagMap";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { InternalCooldownTag } from "genshin-world";

const internalCooldownTags: readonly string[] = Object.values(InternalCooldownTag);
const checkIsInternalCooldownTag = (tag: string): tag is InternalCooldownTag => internalCooldownTags.includes(tag);

// The internal cooldown tag a gcsim ICD tag gives a hit, undefined for the one gcsim names for a hit with none. A tag the
// Map does not hold is one the kit has no tag for, and is refused by name rather than carried on as gcsim's literal
export const toGcsimInternalCooldownTag = (identifier: string): InternalCooldownTag | undefined => {
  if (identifier === GCSIM_NO_INTERNAL_COOLDOWN_TAG) return undefined;
  const tag = GcsimInternalCooldownTagMap[identifier] ?? identifier;
  if (checkIsInternalCooldownTag(tag)) return tag;
  throw new InvalidOperationError(
    Operation.Read,
    identifier,
    "is a gcsim ICD tag the kit has no internal cooldown tag for",
  );
};
