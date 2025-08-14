import { Readable } from "node:stream";

export const isReadableStream = (value: unknown): value is NodeJS.ReadableStream => value instanceof Readable;
