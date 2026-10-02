// A stretch of one source a music track plays, in milliseconds: where in the segment it starts (its source's own start,
// Before its trim), how much is trimmed from each end, and its source's whole duration
export interface MusicClip {
  beginTrim: number;
  duration: number;
  endTrim: number;
  playAt: number;
  sourceId: number;
}
