// Which items fold into a toolbar's overflow menu, by the width each takes and the gap after it. Nothing folds while
// Every item fits. Once something does not, the pinned items stay and the rest stay in order until one no longer fits
// Beside the pinned ones and the overflow button; that one and each after it fold
export const getToolbarFolds = ({
  availableWidth,
  gap,
  items,
  overflowWidth,
}: {
  availableWidth: number;
  gap: number;
  items: { isPinned?: boolean; width: number }[];
  overflowWidth: number;
}) => {
  // Each slot takes its width and the gap after it, and the bar's last gap is the room its availableWidth leaves over
  const capacity = availableWidth + gap;
  const totalWidth = items.reduce((sum, { width }) => sum + width + gap, 0);
  if (totalWidth <= capacity) return items.map(() => false);

  const pinnedWidth = items.reduce((sum, { isPinned, width }) => (isPinned ? sum + width + gap : sum), 0);
  let freeWidth = capacity - (overflowWidth + gap) - pinnedWidth;
  let isFolding = false;
  return items.map(({ isPinned, width }) => {
    if (isPinned) return false;
    if (!isFolding && width + gap <= freeWidth) {
      freeWidth -= width + gap;
      return false;
    }

    isFolding = true;
    return true;
  });
};
