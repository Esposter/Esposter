// Where the navigation mark is drawn on the screen, as shares of its width and height from the top left, and the turn of
// Its arrow in radians, clockwise from up, which the arrow shows only while the landmark is out of view
export interface NavigationMark {
  angle: number;
  isOutOfView: boolean;
  left: number;
  top: number;
}
