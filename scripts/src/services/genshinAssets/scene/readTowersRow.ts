import { readWorldData } from "#src/services/genshinAssets/shared/readWorldData";

// The row MonoLoginScene scrolls the towers in, their bridges and pillars with them, as the scene draws it
export const readTowersRow = async (): Promise<{ count: number; length: number }> =>
  (await readWorldData<{ LoginScene_Build_All: { count: number; length: number } }>("login/scroll.json"))
    .LoginScene_Build_All;
