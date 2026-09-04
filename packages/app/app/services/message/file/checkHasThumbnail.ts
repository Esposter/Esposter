import type { FileEntity } from "@esposter/db-schema";

import { getMimeCategory, MimeCategory } from "@esposter/db-schema";

// A thumbnail blob exists only where the uploader recorded writing one for an image (see FileEntity.hasThumbnail).
// Both the minting side and the sweep that checks whether minting succeeded ask this, so neither can drift from
// The other into minting urls for a blob that was never written or re-minting one that is already held.
export const checkHasThumbnail = ({ hasThumbnail, mimetype }: Pick<FileEntity, "hasThumbnail" | "mimetype">) =>
  hasThumbnail && getMimeCategory(mimetype) === MimeCategory.Image;
