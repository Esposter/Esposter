import { Readable } from "node:stream";

export const checkIsReadableStream = (value: unknown): value is NodeJS.ReadableStream => value instanceof Readable;
