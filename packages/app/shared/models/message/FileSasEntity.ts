import type { FileEntity } from "#shared/models/azure/FileEntity";

export interface FileSasEntity extends Pick<FileEntity, "id"> {
  sasUrl: string;
}
