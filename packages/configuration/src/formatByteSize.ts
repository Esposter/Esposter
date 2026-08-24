import { KIBIBYTE } from "#src/constants";
import { basename } from "node:path";

export const formatByteSize = (absolutePath: string, sizeInBytes: number): string =>
  `${basename(absolutePath)}: ${(sizeInBytes / KIBIBYTE).toFixed(2)} KB (${sizeInBytes} bytes)`;
