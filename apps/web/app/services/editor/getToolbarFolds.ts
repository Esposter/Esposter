// Which items fold into a toolbar's overflow menu, by the width each takes and the gap after it. Nothing folds while
// Every item fits, and the overflow button is part of that fit when the bar always holds items in its menu, since the
// Bar draws the button for them. Once something does not, the pinned items stay and the rest stay in order until one no
// Longer fits beside the pinned ones and the overflow button; that one and each after it fold
export const getToolbarFolds = ({
  availableWidth,
  gap,
  isOverflowHeld,
  items,
  overflowWidth,
}: {
  availableWidth: number;
  gap: number;
  isOverflowHeld: boolean;
  items: { isPinned?: boolean; width: number }[];
  overflowWidth: number;
}) => {
  // Each slot takes its width and the gap after it, and the bar's last gap is the room its availableWidth leaves over
  const capacity = availableWidth + gap;
  const totalWidth = items.reduce((sum, { width }) => sum + width + gap, 0);
  const heldOverflowWidth = isOverflowHeld ? overflowWidth + gap : 0;
  if (totalWidth + heldOverflowWidth <= capacity) return items.map(() => false);

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
