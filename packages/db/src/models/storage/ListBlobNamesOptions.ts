export interface ListBlobNamesOptions {
  // Keeps only blobs created strictly before this instant — the filter a prefix sweep needs so a blob that was
  // Just uploaded, but whose owning row write has not landed yet, is never mistaken for an orphan. R2 reports when an
  // Object was last written, which is never before it was created, so the filter only ever holds a blob back longer
  createdBefore?: Date;
}
