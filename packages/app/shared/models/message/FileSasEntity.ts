import type { FileEntity } from "@esposter/shared";

export interface FileSasEntity extends Pick<FileEntity, "id"> {
  sasUrl: string;
}
