// One axis of a measure: the layout centre, the unscaled length and the parent's content span along the same axis
export interface PanzoomAxis {
  center: number;
  length: number;
  parentLength: number;
  parentStart: number;
}
