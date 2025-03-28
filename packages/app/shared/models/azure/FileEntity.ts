import { z } from "zod";

export class FileEntity {
  mimetype!: string;

  url!: string;
}

export const fileEntitySchema = z.object({
  mimetype: z.string(),
  url: z.string(),
}) as const satisfies z.ZodType<FileEntity>;
