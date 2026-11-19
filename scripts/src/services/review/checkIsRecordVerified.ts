import { checkIsRecordCommit } from "#src/services/review/checkIsRecordCommit";

// Whether the record at a window's end is current, so `main` may move to it. That is the commit the run checked, the build's
// Own commit, and a record commit the review wrote on a commit it had built, which is current for itself since a record
// Changes nothing a build reads. Any other end may hold a stale record, so `main` waits for a window that ends on one.
export const checkIsRecordVerified = (sha: string, tip: string | undefined): boolean =>
  sha === tip || checkIsRecordCommit(sha);
