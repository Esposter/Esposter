import { z } from "zod";

export class FileEntity {
  description?: string;
  filename!: string;
  mimetype!: string;
  url!: string;
}

export const fileEntitySchema = z.object({
  description: z.string().optional(),
  filename: z.string(),
  mimetype: z.string(),
  url: z.string(),
}) satisfies z.ZodType<FileEntity>;
