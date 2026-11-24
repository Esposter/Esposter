import { walkParentChain } from "#src/services/genshinAssets/shared/walkParentChain";

// Each bone's path from the rig's root, its names run down through its parents to it, the root's own empty
// Name leading. A clip binds its bones by these paths, so a rig the clip's component does not carry names them all the
// Same way
export const computeBonePaths = (bones: readonly { name: string; parent: number }[]): string[] =>
  bones.map((_bone, index) =>
    walkParentChain(index, (bone) => {
      const parent = bones[bone]?.parent ?? -1;
      return parent === -1 ? undefined : parent;
    })
      .map((bone) => bones[bone]?.name ?? "")
      .join("/"),
  );
