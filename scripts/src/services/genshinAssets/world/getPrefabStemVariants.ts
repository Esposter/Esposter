// The names a prefab may carry where its meshes and materials name it: the name itself, with a LOD or collision suffix
// Dropped, and with the `_Vo` or `_Group` suffix of a prefab's own added or dropped
export const getPrefabStemVariants = (name: string): Set<string> => {
  const stems = new Set([
    name,
    name.replace(/_Col$/, ""),
    name.replace(/_Col$/, "").replace(/_Lod\d+$/, ""),
    name.replace(/_Lod\d+$/, ""),
  ]);
  for (const stem of [...stems])
    for (const variant of [stem.replace(/_Vo$/, ""), `${stem}_Vo`, stem.replace(/_Group$/, "")]) stems.add(variant);
  return stems;
};
