// Each bone's path from the rig's root, its names run down through its parents to it, the root's own empty name leading.
// A clip binds its bones by these paths, so a rig the clip's component does not carry names them all the same way
export const computeBonePaths = (bones: readonly { name: string; parent: number }[]): string[] =>
  bones.map((_bone, index) => {
    const names: string[] = [];
    for (let bone = index; bone !== -1; bone = bones[bone]?.parent ?? -1) names.unshift(bones[bone]?.name ?? "");
    return names.join("/");
  });
