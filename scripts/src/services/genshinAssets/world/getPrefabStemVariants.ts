// The names a prefab may carry where its meshes and materials name it: the name itself, with a LOD or collision suffix
// Dropped, and with the `_Vo` or `_Group` suffix of a prefab's own added or dropped
export const getPrefabStemVariants = (name: string): Set<string> => {
  const stems = new Set([
    name,
    name.replace(/_Col$/u, ""),
    name.replace(/_Col$/u, "").replace(/_Lod\d+$/u, ""),
    name.replace(/_Lod\d+$/u, ""),
  ]);
  const originalStems = [...stems];
  for (const stem of originalStems)
    for (const variant of [stem.replace(/_Vo$/u, ""), `${stem}_Vo`, stem.replace(/_Group$/u, "")]) stems.add(variant);
  return stems;
};
