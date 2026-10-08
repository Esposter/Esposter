import type { InteractiveMapLabel } from "#src/models/genshinAssets/points/InteractiveMapLabel";

// One label of the map's tree with the id of the top-level category it sits under, the category being the label itself
// When it is one
export interface FlatInteractiveMapLabel {
  categoryId: number;
  id: number;
  name: string;
}

// Every label of the tree, flattened, each carrying the id of the category at the top of its branch
export const flattenLabelTree = (
  labels: readonly InteractiveMapLabel[],
  categoryId?: number,
): FlatInteractiveMapLabel[] =>
  labels.flatMap((label) => {
    const labelCategoryId = categoryId ?? label.id;
    return [
      { categoryId: labelCategoryId, id: label.id, name: label.name },
      ...flattenLabelTree(label.children, labelCategoryId),
    ];
  });
