export interface ExpressResult {
  // The commits that applied, in queue order. Empty when the lane was closed or nothing qualified
  shas: string[];
  // The candidate's head, to push to `main` — absent when nothing applied
  targetSha?: string;
}
