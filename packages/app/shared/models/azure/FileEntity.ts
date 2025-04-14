import { z } from "zod";

export class FileEntity {
  mimetype!: string;

  url!: string;
}

export const fileEntitySchema = z.interface({
  mimetype: z.string(),
  url: z.string(),
}) satisfies z.ZodType<FileEntity>;
