import type { UiIndexEntry } from "#src/models/genshinAssets/ui/UiIndexEntry";

// A piece's children in the order its Transform lists them, which is the order the game draws them. A child the list
// lacks (its Transform's dump lost) follows the listed ones
export const orderInterfaceChildren = (
  children: readonly UiIndexEntry[],
  childIds: readonly string[],
): UiIndexEntry[] => {
  const rankOf = ({ transformId }: UiIndexEntry): number => {
    const index = childIds.indexOf(transformId);
    return index === -1 ? childIds.length : index;
  };
  return children.toSorted((firstChild, secondChild) => rankOf(firstChild) - rankOf(secondChild));
};
