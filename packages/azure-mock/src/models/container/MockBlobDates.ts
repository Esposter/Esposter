// The service-maintained timestamps for a blob written through a client. The two move differently and code
// Branches on the difference: overwriting a blob advances `lastModified` and leaves `createdOn` at the original
// Create, which is what lets an age filter tell "written again just now" from "first written long ago".
// Modelling both as the write instant makes a re-upload look fresh on both axes and quietly passes any test
// That depends on the distinction.
export interface MockBlobDates {
  createdOn: Date;
  // Re-minted on every write, which is what makes it usable as a claim: a caller that read the blob and then
  // Writes with `ifMatch` set to what it read only wins if nothing wrote in between. A value invented per read
  // (a fresh uuid each time it is asked) can never match, so every conditional write would fail.
  etag: string;
  lastModified: Date;
}
