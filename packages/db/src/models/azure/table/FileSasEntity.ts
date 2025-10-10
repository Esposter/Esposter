import type { FileEntity } from "@/models/azure/table/FileEntity";

export interface FileSasEntity extends Pick<FileEntity, "id"> {
  sasUrl: string;
}
