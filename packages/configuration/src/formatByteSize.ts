import { basename } from "node:path";

import { KIBIBYTE } from "./constants";

export const formatByteSize = (absolutePath: string, sizeInBytes: number): string =>
  `${basename(absolutePath)}: ${(sizeInBytes / KIBIBYTE).toFixed(2)} KB (${sizeInBytes} bytes)`;
