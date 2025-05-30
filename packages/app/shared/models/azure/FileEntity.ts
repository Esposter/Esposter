import { FILENAME_MAX_LENGTH } from "#shared/services/azure/container/constants";
import { z } from "zod/v4";

export class FileEntity {
  filename!: string;
  id!: string;
  mimetype!: string;
  size!: number;

  constructor(init?: Partial<FileEntity>) {
    Object.assign(this, init);
  }
}

export const fileEntitySchema = z.object({
  filename: z.string().min(1).max(FILENAME_MAX_LENGTH),
  id: z.uuid(),
  mimetype: z.string(),
  size: z.int().positive(),
}) satisfies z.ZodType<FileEntity>;
