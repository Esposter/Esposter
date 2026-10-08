// An enemy's name drawn over it under the sight: the spawn key it is found by, its name, and where it sits on the screen
// As percentages of the screen's width and height
export interface SightNameTag {
  key: string;
  left: number;
  name: string;
  top: number;
}
