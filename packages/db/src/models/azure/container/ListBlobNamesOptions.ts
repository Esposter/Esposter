export interface ListBlobNamesOptions {
  // Keeps only blobs created strictly before this instant — the filter a prefix sweep needs so a blob that was
  // Just uploaded, but whose owning row write has not landed yet, is never mistaken for an orphan
  createdBefore?: Date;
}
