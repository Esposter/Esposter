// The fixes branch the port reads, which is the sha the step started with when nothing was drained. Nothing in the
// Drain ends the run: a drain past its cap defers its findings, and a session that could not start throws
export interface DrainStepResult {
  reviewFixesSha?: string;
}
