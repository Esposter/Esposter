import type { FileEntity } from "#shared/models/azure/FileEntity";

export interface ParsedFileEntity extends FileEntity {
  url: string;
}
