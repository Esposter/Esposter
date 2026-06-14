import { FILENAME_MAX_LENGTH } from "@/services/azure/container/constants";
import { getPropertyNames } from "@esposter/shared";
import { z } from "zod";

export class FileEntity {
  declare filename: string;
  declare id: string;
  declare mimetype: string;
  declare size: number;

  constructor(init?: Partial<FileEntity>) {
    Object.assign(this, init);
  }
}

export const FileEntityPropertyNames = getPropertyNames<FileEntity>();

export const fileEntitySchema = z.object({
  filename: z.string().min(1).max(FILENAME_MAX_LENGTH),
  id: z.uuid(),
  mimetype: z.string(),
  size: z.int().positive(),
}) satisfies z.ZodType<FileEntity>;
