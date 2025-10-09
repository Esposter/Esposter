import type { PropertyNames } from "@/util/types/PropertyNames";

import { FILENAME_MAX_LENGTH } from "@/services/azure/container/constants";
import { getPropertyNames } from "@/util/object/getPropertyNames";
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

export const FileEntityPropertyNames: PropertyNames<FileEntity> = getPropertyNames<FileEntity>();

export const fileEntitySchema: z.ZodObject<{
  filename: z.ZodString;
  id: z.ZodUUID;
  mimetype: z.ZodString;
  size: z.ZodNumber;
}> = z.object({
  filename: z.string().min(1).max(FILENAME_MAX_LENGTH),
  id: z.uuid(),
  mimetype: z.string(),
  size: z.int().positive(),
}) satisfies z.ZodType<FileEntity>;
