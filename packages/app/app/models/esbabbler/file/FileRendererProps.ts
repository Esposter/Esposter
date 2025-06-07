import type { FileEntity } from "#shared/models/azure/FileEntity";

export interface FileRendererProps {
  file: FileEntity;
  isPreview?: boolean;
  url: string;
}
