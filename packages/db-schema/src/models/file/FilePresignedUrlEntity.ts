import type { FileEntity } from "#src/models/streams/FileEntity";

export interface FilePresignedUrlEntity extends Pick<FileEntity, "id"> {
  presignedUrl: string;
  // Present only for image uploads — the presigned write url for the sibling {prefix}/{id}.thumb thumbnail blob.
  thumbnailPresignedUrl?: string;
}
