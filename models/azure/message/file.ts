import type { toZod } from "tozod";
import { z } from "zod";

export class FileEntity {
  url!: string;

  mimetype!: string;
}

export const fileSchema: toZod<FileEntity> = z.object({
  url: z.string(),
  mimetype: z.string(),
});
