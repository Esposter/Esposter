import type { SetRequired } from "type-fest";
import type { BuilderOptions, ParserOptions } from "xml2js";

export const DefaultCommonOptions: SetRequired<
  {
    [P in keyof BuilderOptions & keyof ParserOptions]: NonNullable<BuilderOptions[P] | ParserOptions[P]>;
  },
  "attrkey" | "charkey"
> = {
  attrkey: "$",
  charkey: "_",
};
