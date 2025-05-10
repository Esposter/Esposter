import type { ParsedFileEntity } from "@/models/esbabbler/file/ParsedFileEntity";

export interface FileRendererProps {
  file: ParsedFileEntity;
  preview?: true;
}
