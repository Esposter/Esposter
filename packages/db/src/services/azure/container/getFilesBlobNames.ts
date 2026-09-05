import type { FileEntity } from "@esposter/db-schema";

import { getFileBlobNames } from "#src/services/azure/container/getFileBlobNames";

// Every blob a set of uploaded files owns, flattened into the single list a delete publishes. Named through
// `getFileBlobNames`, so a derivative added there is swept by every caller without a second edit.
export const getFilesBlobNames = (prefix: string, files: Pick<FileEntity, "filename" | "id">[]) =>
  files.flatMap(({ filename, id }) => Object.values(getFileBlobNames(prefix, id, filename)));
