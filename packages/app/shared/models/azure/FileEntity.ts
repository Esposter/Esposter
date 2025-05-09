import { FILENAME_MAX_LENGTH } from "#shared/services/esbabbler/constants";
import { z } from "zod";

export class FileEntity {
  description?: string;
  filename!: string;
  mimetype!: string;
  url!: string;
}

export const fileEntitySchema = z.object({
  description: z.string().optional(),
  filename: z.string().min(1).max(FILENAME_MAX_LENGTH),
  mimetype: z.string(),
  // @TODO: z.url()
  url: z.string(),
}) satisfies z.ZodType<FileEntity>;
