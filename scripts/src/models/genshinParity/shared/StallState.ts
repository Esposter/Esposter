// What one state of the stall run drew: the frame times it took, the worst and how many ran past 50 and 250 milliseconds,
// The programs held before and after, and each moment (from the state's first frame) the programs grew at
export interface StallState {
  frames: number;
  growthAt: { atMs: number; programs: number }[];
  maxFrameMs: number;
  name: string;
  over50: number;
  over250: number;
  programsAfter: number | null;
  programsBefore: number | null;
}
