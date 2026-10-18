import { NAME_TEXT_ID_KEYS } from "#src/services/genshinText/constants";

// Adds the text hash of every name and description at any depth, so a nested one is found the same as a top-level one.
// A key holding a list adds each of its hashes, and an empty hash, which a weapon with no passive holds, adds none
export const collectNameTextIds = (value: unknown, textIds: Set<string>): void => {
  if (Array.isArray(value)) {
    for (const item of value) collectNameTextIds(item, textIds);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (!NAME_TEXT_ID_KEYS.includes(key)) {
      collectNameTextIds(child, textIds);
      continue;
    }
    for (const textId of [child].flat()) if (textId !== "") textIds.add(String(textId));
  }
};
