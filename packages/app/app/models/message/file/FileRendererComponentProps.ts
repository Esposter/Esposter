import type { FileEntity } from "#shared/models/azure/FileEntity";

export interface FileRendererComponentProps {
  file: FileEntity;
  isPreview?: boolean;
  url: string;
}
