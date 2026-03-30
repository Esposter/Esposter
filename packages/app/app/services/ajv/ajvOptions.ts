import type { Options } from "ajv";

import { uniqueColumnNameKeywordDefinition } from "@/services/ajv/keywords/uniqueColumnNameKeywordDefinition";

export const ajvOptions: Options = {
  keywords: [uniqueColumnNameKeywordDefinition],
};
