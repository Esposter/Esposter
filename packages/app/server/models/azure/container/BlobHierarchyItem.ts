import type { BlobItem, BlobPrefix } from "@azure/storage-blob";

export type BlobHierarchyItem =
  | (BlobItem & {
      kind: "blob";
    })
  | (BlobPrefix & {
      kind: "prefix";
    });
