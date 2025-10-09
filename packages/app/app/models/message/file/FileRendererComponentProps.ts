import type { FileEntity } from "@esposter/shared";

export interface FileRendererComponentProps {
  file: FileEntity;
  isPreview?: boolean;
  url: string;
}
