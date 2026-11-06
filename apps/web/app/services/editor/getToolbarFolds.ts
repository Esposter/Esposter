// Which items fold into a toolbar's overflow menu, by the width each takes. Nothing folds while every item fits. Once
// Something does not, the pinned items stay and the rest stay in order until one no longer fits beside the pinned ones
// And the overflow button; that one and each after it fold
export const getToolbarFolds = ({
  availableWidth,
  items,
  overflowWidth,
}: {
  availableWidth: number;
  items: { isPinned?: boolean; width: number }[];
  overflowWidth: number;
}) => {
  const totalWidth = items.reduce((sum, { width }) => sum + width, 0);
  if (totalWidth <= availableWidth) return items.map(() => false);

  const pinnedWidth = items.reduce((sum, { isPinned, width }) => (isPinned ? sum + width : sum), 0);
  let freeWidth = availableWidth - overflowWidth - pinnedWidth;
  let isFolding = false;
  return items.map(({ isPinned, width }) => {
    if (isPinned) return false;
    if (!isFolding && width <= freeWidth) {
      freeWidth -= width;
      return false;
    }

    isFolding = true;
    return true;
  });
};
