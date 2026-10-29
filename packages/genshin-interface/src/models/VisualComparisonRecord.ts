// A visual suite's tally over its cases, which every suite keeps the same way: a shot is recorded once its comparison
// Settles, then the mismatches over the bar are reported after the run rather than failed
export interface VisualComparisonRecord {
  // A shot that differs from its image, or is missing one, or fails some other way than a comparison
  recordFailure: (error: unknown, title: string) => void;
  // A shot that matches its image
  recordWithinBar: () => void;
  // Prints the cases over the bar, worst first, and how many were within it or had no image
  report: () => void;
}
