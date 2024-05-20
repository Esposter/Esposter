import { z } from "zod";

export class FileEntity {
  url!: string;

  mimetype!: string;
}

export const fileSchema = z.object({ url: z.string(), mimetype: z.string() }) satisfies z.ZodType<FileEntity>;
