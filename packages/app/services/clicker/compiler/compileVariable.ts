import type { ClickerItemProperties } from "@/models/clicker/ClickerItemProperties";

import { VARIABLE_IDENTIFIER } from "@/services/clicker/constants";

export const compileVariable = (property: keyof ClickerItemProperties) =>
  `${VARIABLE_IDENTIFIER}${property as string}${VARIABLE_IDENTIFIER}`;
