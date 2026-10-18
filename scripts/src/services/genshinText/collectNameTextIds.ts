import { NAME_TEXT_ID_KEYS } from "#src/services/genshinText/constants";

// Adds the text hash of every name and description at any depth, so a nested one is found the same as a top-level one
export const collectNameTextIds = (value: unknown, textIds: Set<string>): void => {
  if (Array.isArray(value)) {
    for (const item of value) collectNameTextIds(item, textIds);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value))
    if (NAME_TEXT_ID_KEYS.includes(key)) textIds.add(String(child));
    else collectNameTextIds(child, textIds);
};
