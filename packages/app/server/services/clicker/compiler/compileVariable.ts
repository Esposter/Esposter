import type { ClickerItemProperties } from "@/models/clicker/ClickerItemProperties";

import { VARIABLE_IDENTIFIER } from "@/shared/services/clicker/constants";

export const compileVariable = (property: keyof ClickerItemProperties) =>
  `${VARIABLE_IDENTIFIER}${property}${VARIABLE_IDENTIFIER}`;
