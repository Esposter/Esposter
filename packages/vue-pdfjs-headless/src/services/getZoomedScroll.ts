// The scroll that keeps the content under a point of the container in place once the content is scaled by a ratio
export const getZoomedScroll = ({ point, ratio, scroll }: { point: number; ratio: number; scroll: number }): number =>
  (scroll + point) * ratio - point;
