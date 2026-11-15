import type { FileEntity, FilePresignedUrlEntity } from "@esposter/db-schema";

// Generic over the entity so a call site whose targets carry more than the url — the composer's delete grant —
// Reads its own shape back out of the upload instead of the base one
export interface UploadFilesToPresignedUrlsOptions<
  TFilePresignedUrlEntity extends FilePresignedUrlEntity = FilePresignedUrlEntity,
> {
  // A write target whose object the server already holds, so there is nothing to PUT for it
  checkIsUploadSkipped?: (filePresignedUrlEntity: TFilePresignedUrlEntity) => boolean;
  files: File[];
  generateUploadFilePresignedUrlEntities: (
    files: Pick<FileEntity, "filename" | "mimetype" | "size">[],
  ) => Promise<TFilePresignedUrlEntity[]>;
  // Each PUT is create-only, so an object already stored at its write target is refused rather than replaced
  isCreateOnly?: boolean;
  onUploadProgress?: (filePresignedUrlEntity: TFilePresignedUrlEntity, progress: number) => void;
  // Runs once after the write targets are generated but before the bytes upload — seed any render state here.
  onUploadStart?: (filePresignedUrlEntities: TFilePresignedUrlEntity[]) => void;
}
