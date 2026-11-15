import type { FileEntity } from "@esposter/db-schema";

export const getFilenames = (files: FileEntity[]): string => files.map(({ filename }) => filename).join(" ");
