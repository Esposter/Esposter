import type { Options } from "ajv";

import { uniqueColumnName } from "@/services/ajv/keywords/uniqueColumnName";

export const ajvOptions: Options = {
  keywords: [uniqueColumnName],
};
