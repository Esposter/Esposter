// The delay a call of a method adds to the queue calls it runs, from the closures it is in, and the line of the
// Innermost one's delay. A call outside every closure adds none, and has no line
export interface CallTiming {
  delay?: number;
  line?: number;
}
