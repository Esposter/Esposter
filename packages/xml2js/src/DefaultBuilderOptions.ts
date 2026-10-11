import type { SetRequired } from "type-fest";
import type { BuilderOptions } from "xml2js";

import { DefaultCommonOptions } from "#src/DefaultCommonOptions";

export const DefaultBuilderOptions: SetRequired<
  BuilderOptions,
  "cdata" | "doctype" | "headless" | "renderOpts" | "rootName" | "xmldec" | keyof typeof DefaultCommonOptions
> = {
  ...DefaultCommonOptions,
  cdata: false,
  doctype: null,
  headless: false,
  renderOpts: { indent: "  ", newline: "\n", pretty: true },
  rootName: "root",
  xmldec: { encoding: "utf8", standalone: true, version: "1.0" },
};
