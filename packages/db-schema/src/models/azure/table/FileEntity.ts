import { BLOB_SEGMENT_REGEX, FILENAME_MAX_LENGTH } from "@/services/azure/container/constants";
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
  // The upload SAS target and every delete that names this file interpolate it into a blob name
  filename: z.string().min(1).max(FILENAME_MAX_LENGTH).regex(BLOB_SEGMENT_REGEX),
  id: z.uuid(),
  mimetype: z.string(),
  size: z.int().positive(),
}) satisfies z.ZodType<FileEntity>;
