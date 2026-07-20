import type { FileEntity } from "@/models/azure/table/FileEntity";

export interface FileSasEntity extends Pick<FileEntity, "id"> {
  sasUrl: string;
  // Present only for image uploads — the write SAS for the sibling {prefix}/{id}.thumb thumbnail blob.
  thumbnailSasUrl?: string;
}
