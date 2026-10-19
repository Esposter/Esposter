// A frame scales down to fit a narrower pane and never scales up, and a pane not yet measured leaves it at 1
export const getFrameScale = (paneWidth: number, frameWidth: number): number =>
  paneWidth > 0 ? Math.min(1, paneWidth / frameWidth) : 1;
