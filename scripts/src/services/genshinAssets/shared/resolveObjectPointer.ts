import type { CabEntry } from "#src/models/genshinAssets/shared/CabEntry";
import type { ObjectPointer } from "#src/models/genshinAssets/shared/ObjectPointer";
import type { ResolvedObject } from "#src/models/genshinAssets/shared/ResolvedObject";

// The object a pointer names, as its file, the block holding that file and its path ID: a path ID names an object only
// Within its file, so a file index of zero stays in the pointer's own file and any other is its file's external
// Reference that many places down, less one. A null pointer, or one whose file the CAB map does not know, names none
export const resolveObjectPointer = (
  cabMap: ReadonlyMap<string, CabEntry>,
  file: string,
  { fileIndex, pathId }: ObjectPointer,
): ResolvedObject | undefined => {
  const target = fileIndex === 0 ? file : cabMap.get(file)?.dependencies[fileIndex - 1];
  const block = target ? cabMap.get(target)?.block : undefined;
  return target && block && pathId !== "0" ? { block, file: target, pathId } : undefined;
};
