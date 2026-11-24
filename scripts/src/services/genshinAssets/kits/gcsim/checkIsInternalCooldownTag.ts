import { InternalCooldownTag } from "genshin-world/definitions";

const internalCooldownTags: readonly string[] = Object.values(InternalCooldownTag);
export const checkIsInternalCooldownTag = (tag: string): tag is InternalCooldownTag =>
  internalCooldownTags.includes(tag);
