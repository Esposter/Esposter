import type { SetRequired } from "type-fest";
import type { BuilderOptions } from "xml2js";

import { DefaultCommonOptions } from "@/DefaultCommonOptions";

export const DefaultBuilderOptions: SetRequired<
  BuilderOptions,
  "cdata" | "doctype" | "renderOpts" | "rootName" | "xmldec" | keyof typeof DefaultCommonOptions
> = {
  ...DefaultCommonOptions,
  cdata: false,
  doctype: null,
  renderOpts: { indent: "  ", newline: "\n", pretty: true },
  rootName: "root",
  xmldec: { encoding: "utf8", standalone: true, version: "1.0" },
};
