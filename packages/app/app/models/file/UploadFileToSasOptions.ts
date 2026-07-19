import type { FileEntity, FileSasEntity } from "@esposter/db-schema";

export interface UploadFileToSasOptions {
  files: File[];
  generateUploadFileSasEntities: (
    files: Pick<FileEntity, "filename" | "mimetype" | "size">[],
  ) => Promise<FileSasEntity[]>;
  onUploadProgress?: (fileSasEntity: FileSasEntity, progress: number) => void;
  // Runs once after the write targets are generated but before the blocks upload — seed any render state here.
  onUploadStart?: (fileSasEntities: FileSasEntity[]) => void;
}
