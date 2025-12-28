import type { FileEntity } from "@esposter/db-schema";

export interface FileRendererComponentProps {
  file: FileEntity;
  isPreview?: boolean;
  url: string;
}
