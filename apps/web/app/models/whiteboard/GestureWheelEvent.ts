import type { Point } from "vue-block-editor-headless";

// A wheel turn as the view reads it: how far it turns across and down in screen pixels, whether Ctrl or Cmd is held (a trackpad pinch
// arrives as a wheel turn with Ctrl held), and the screen point it turns over
export interface GestureWheelEvent {
  deltaX: number;
  deltaY: number;
  isZoomKey: boolean;
  screen: Point;
}
