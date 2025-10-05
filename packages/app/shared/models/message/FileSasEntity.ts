import type { FileEntity } from "#shared/models/azure/table/FileEntity";

export interface FileSasEntity extends Pick<FileEntity, "id"> {
  sasUrl: string;
}
