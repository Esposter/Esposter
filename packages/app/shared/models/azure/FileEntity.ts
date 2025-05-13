import { FILENAME_MAX_LENGTH } from "#shared/services/azure/container/constants";
import { z } from "zod";

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
  id: z.string().uuid(),
  mimetype: z.string(),
  size: z.number().int().nonnegative(),
}) satisfies z.ZodType<FileEntity>;
