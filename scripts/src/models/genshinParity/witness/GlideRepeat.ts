// One repeat of a layout gliding past a recording's column: the column and the kind of crossing that times it, its
// First and last moments in seconds, its pace with its uncertainty in metres a second, and the frames within it the
// Recording holds, a game stalled under them gliding less than its pace over the stall
export interface GlideRepeat {
  column: number;
  from: number;
  heldCount: number;
  isFalling: boolean;
  speed: number;
  to: number;
  uncertainty: number;
}
