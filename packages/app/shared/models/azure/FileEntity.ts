import type { Type } from "arktype";

import { type } from "arktype";

export class FileEntity {
  mimetype!: string;
  url!: string;
}

export const fileEntitySchema = type({
  mimetype: "string",
  url: "string",
}) satisfies Type<FileEntity>;
