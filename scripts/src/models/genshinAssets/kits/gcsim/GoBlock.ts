// The braces a block's assignment dominates a position in: the block it sits in, or the `case` clause of a switch
export interface GoBlock {
  end: number;
  start: number;
}
