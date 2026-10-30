import { CloseButtonMark } from "#src/models/CloseButtonMark";

// Each mark's path, traced at four times off the English client at 1920 by 1080: the cross from the quest screen
// (`File:Quest Screen.png`) and the back arrow from the archive screen at 19.5 seconds of its recording.
// Each is in its own screen's pixels.
// The view box is the close button's 58 units as a window onto the path.
// The cross's box lies 6 units left and 5 up of the button's top left, so its window starts at 6 and 5.
// The arrow's lies 13 right and 13 down, so its window starts at -13 and -13.
export const CloseButtonMarkGlyphMap: Record<CloseButtonMark, { path: string; viewBox: string }> = {
  [CloseButtonMark.Back]: {
    path: "M15.63 1.75l0.38 0.38v2.75l-0.25 0.25v2l0.88 0.88 4.5 0.25 2.75 1h1l0.5 0.5 1.75 0.75 2.13 1.88 1.25 1.75 0.75 2.25 0.75 0.75v5.38q-0.67-0.28-0.5 0.38l-0.75 1.75-2.87 3.38q-1.060.19-1.5 1l-2.75 1.25-2 0.25-0.25 0.25h-1.25q-0.37-0.25 0.25-0.5h0.5l1-1 1-0.25 1.5-1.25h0.38q-0.12-0.72 0.63-1 0.560.19 0.38-0.37l0.5-0.5 0.25-1.25 0.5-0.75q-0.17-1.04 0.25-1.5l-0.25-0.25q0.21-1.21-0.25-1.75l-2.12-2.37h-0.75l-1-0.75h-0.75l-1.25-0.5h-3.5l-1.62 0.88-0.25 1.25 0.25 0.25v2.25q0.56 0.31 0.25 1.5l-0.62 0.38-3.5-3.25-2-1.25-1.5-1.5-6.62-3.62v-0.5q0.63-0.25 0.5-0.87l0.88-0.25 1.5-1 1.25-1.25 1.5-0.75 2.88-2.37q-0.19-0.56 0.38-0.37l5-4.5z",
    viewBox: "-13 -13 58 58",
  },
  [CloseButtonMark.Cross]: {
    path: "M22.25 20l-1 .75v2.5l.25.25.25 3.25.25.25v1.25l.25.5q1 .25 1.75-.5h1.25l1.5 1.25q.5-.25.25.5h.5l3.5 3.75v1l-4 4-1.75 1.25h-1.25q-.75-.75-1.75-.5l-.25.75-.25 3-.25.25v1.5l-.25.25v2.5l1 .5q1 .25 1.5-.25h3l.25-.25h2l.75-.5q.25-1.5-.5-1.75v-1l1.5-1.75 4.5-4.25h.5l1 1q.5-.25.25.5l.75.25.25.75.75.25v.5l2.5 2.75v1l-.5 1v.75l1 .5h2l.25.25h3.75l.25.25q1.25.25 1.5-.5l-.25-3.75-.25-.25v-2l-.25-.25v-1.25l-.25-.75h-1l-1 .75-1-.25-.5-.75-.75-.25-4.5-4.25v-1l6-5.75h.75l1 .75h1q-.25-.75.25-.75v-1l.25-.25.25-4.25.25-.25q.5-1.75-.5-2.25h-1.75l-.25.25h-2.75l-.25.25h-2.5l-.75.75v.75l.5 1v1l-2.25 2.75-.5.25-.5.75-2.25 2h-.75l-4.25-4-.75-1v-.5l-.75-.25v-.75l.5-1v-1l-.75-.75h-1.5l-.25-.25h-3.5q-.5-.5-1.5-.25z",
    viewBox: "6 5 58 58",
  },
};
