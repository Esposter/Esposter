import type { GcsimConfig } from "#src/models/genshinAssets/kits/gcsim/GcsimConfig";

// The rows of a talent variable's table: one more than the highest row any of its leaves names.
// A variable the config names as one reference is one row of levels rather than a list of rows, so it has none
export const readTalentRowCount = (config: GcsimConfig, name: string): number | undefined => {
  const leaves = config.talentVariables.find((variable) => variable.name === name)?.leaves;
  if (leaves === undefined || leaves.length === 0 || leaves.some(({ path }) => path.length === 0)) return undefined;
  return Math.max(...leaves.map(({ path: [row = 0] }) => row + 1));
};
