import type { FileEntity } from "@esposter/db";

export interface FileRendererComponentProps {
  file: FileEntity;
  isPreview?: boolean;
  url: string;
}
