import type { FileEntity } from "#shared/models/azure/FileEntity";
import type { Except } from "type-fest";

export interface FileRendererProps extends Except<FileEntity, "description"> {
  language?: string;
  preview?: true;
}
