import type { SetRequired } from "type-fest";
import type { ParserOptions } from "xml2js";

import { DefaultCommonOptions } from "@/DefaultCommonOptions";

export const DefaultParserOptions: SetRequired<
  ParserOptions,
  | "async"
  | "charsAsChildren"
  | "childkey"
  | "chunkSize"
  | "emptyTag"
  | "explicitArray"
  | "explicitChildren"
  | "explicitRoot"
  | "ignoreAttrs"
  | "includeWhiteChars"
  | "mergeAttrs"
  | "normalize"
  | "normalizeTags"
  | "preserveChildrenOrder"
  | "strict"
  | "trim"
  | "xmlns"
  | keyof typeof DefaultCommonOptions
> = {
  ...DefaultCommonOptions,
  async: false,
  charsAsChildren: false,
  childkey: "$$",
  chunkSize: 10000,
  emptyTag: "" as (() => void) | string,
  explicitArray: true,
  explicitChildren: false,
  explicitRoot: true,
  ignoreAttrs: false,
  // include white-space only text nodes
  includeWhiteChars: false,
  mergeAttrs: false,
  normalize: false,
  normalizeTags: false,
  preserveChildrenOrder: false,
  strict: true,
  trim: false,
  xmlns: false,
};
