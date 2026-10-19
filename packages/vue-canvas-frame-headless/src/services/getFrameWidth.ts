// A filling frame is never narrower than its least width, and grows to the pane when the pane is wider
export const getFrameWidth = (width: number, fill: boolean, paneWidth: number): number =>
  fill ? Math.max(paneWidth, width) : width;
