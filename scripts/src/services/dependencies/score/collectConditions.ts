import { checkIsPlainObject } from "@esposter/shared";

// Every condition an `exports` map names at any depth, a subpath key (`.`, `./x`) excluded since it names no condition
export const collectConditions = (value: unknown, conditions: Set<string>): void => {
  if (!checkIsPlainObject(value)) return;

  for (const [key, child] of Object.entries(value)) {
    if (!key.startsWith(".")) conditions.add(key);
    collectConditions(child, conditions);
  }
};
