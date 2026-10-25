import type { GoValue } from "#src/models/genshinAssets/kits/gcsim/GoValue";

// A strike's frames from `attackFrames`, one per strike, or one list per state of the strikes, the first state's read
export const readStrikeFrames = (value: GoValue | undefined, strikeIndex: number): GoValue | undefined => {
  if (!Array.isArray(value)) return undefined;
  const strikeList = Array.isArray(value[0]) ? value[0] : value;
  return strikeList[strikeIndex];
};
