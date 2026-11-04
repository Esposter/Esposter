import type { GridGeometry } from "vue-grid-layout-headless";

// The box a cell is drawn in. An auto-height visual takes the height its content draws, so it has none of its own
export const getGeometryStyle = ({ height, left, top, width }: GridGeometry, isAutoHeight: boolean) => ({
  height: isAutoHeight ? undefined : `${height}px`,
  left: `${left}px`,
  top: `${top}px`,
  width: `${width}px`,
});
