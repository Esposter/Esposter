import type { FileEntity, FileSasEntity } from "@esposter/db-schema";

// Generic over the entity so a call site whose targets carry more than the url — the composer's delete grant —
// Reads its own shape back out of the upload instead of the base one
export interface UploadFileToSasOptions<TFileSasEntity extends FileSasEntity = FileSasEntity> {
  // A write target whose object the server already holds, so there is nothing to PUT for it
  checkIsUploadSkipped?: (fileSasEntity: TFileSasEntity) => boolean;
  files: File[];
  generateUploadFileSasEntities: (
    files: Pick<FileEntity, "filename" | "mimetype" | "size">[],
  ) => Promise<TFileSasEntity[]>;
  // Each block list commit is create-only, so a blob already stored at its write target is refused rather than replaced
  isCreateOnly?: boolean;
  onUploadProgress?: (fileSasEntity: TFileSasEntity, progress: number) => void;
  // Runs once after the write targets are generated but before the blocks upload — seed any render state here.
  onUploadStart?: (fileSasEntities: TFileSasEntity[]) => void;
}
