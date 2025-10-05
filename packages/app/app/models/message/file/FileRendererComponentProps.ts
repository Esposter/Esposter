import type { FileEntity } from "#shared/models/azure/table/FileEntity";

export interface FileRendererComponentProps {
  file: FileEntity;
  isPreview?: boolean;
  url: string;
}
