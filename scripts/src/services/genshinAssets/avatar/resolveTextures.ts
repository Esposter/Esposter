import type { MaterialValues } from "#src/models/genshinAssets/shared/MaterialValues";
import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";
import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";

import { resolveObjectPointer } from "#src/services/genshinAssets/shared/resolveObjectPointer";

// The texture each slot points at, through the file its material lies in. An empty slot's pointer names none
export const resolveTextures = (
  textures: MaterialValues["textures"],
  file: string,
  cabMap: ReadonlyMap<string, CabEntry>,
): Record<string, ResolvedObject> =>
  Object.fromEntries(
    Object.entries(textures).flatMap(([slot, pointer]): [string, ResolvedObject][] => {
      const texture = resolveObjectPointer(cabMap, file, pointer);
      return texture ? [[slot, texture]] : [];
    }),
  );
