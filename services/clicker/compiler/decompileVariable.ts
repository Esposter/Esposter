import type { ClickerItemProperties } from "@/models/clicker/ClickerItemProperties";
import { Operation } from "@/models/shared/Operation";
import { compileVariable } ~/packages/shared/models/shared/Operationcompiler/compileVariable";
import { VARIABLE_REGEX } from "@/services/clicker/constants";
import { InvalidOperationError } from "~/packages/shared/models/error/InvalidOperationError";

export const decompileVariable = (string: string, clickerItemProperties: ClickerItemProperties) => {
  const variableMatches = string.matchAll(VARIABLE_REGEX);

  let decompiledString = string;
  for (const variableMatch of variableMatches) {
    const property = variableMatch[1] as keyof ClickerItemProperties;
    const value = clickerItemProperties[property];
    if (typeof value !== "string")
      throw new InvalidOperationError(
        Operation.Read,
        decompileVariable.name,
        `string: "${string}" contains invalid variable: ${property}`,
      );

    decompiledString = decompiledString.replaceAll(compileVariable(property), value);
  }
  return decompiledString;
};
