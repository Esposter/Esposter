// An annotation on a job's check run, GitHub's own spelling: a red step leaves one at the failure level, and the
// Collector's own error line is another (`writeErrorAnnotation`)
export interface JobAnnotation {
  annotation_level: string;
  message: string;
  start_line: number;
}
