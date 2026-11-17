import type { BlueprintParameter } from "#shared/models/resource/blueprint/BlueprintParameter";

import { getInvalidBlueprintError } from "#server/services/blueprint/getInvalidBlueprintError";

// A parameter with a list takes one of its values, so a value outside it is refused before anything is substituted
// Or created. The map holds each parameter's resolved value, where a deploy-time value overrides the default
export const validateBlueprintParameterValues = (
  parameters: BlueprintParameter[],
  resolvedParameters: Map<string, string>,
): void => {
  for (const { allowedValues, key } of parameters) {
    if (allowedValues === undefined) continue;

    if (!allowedValues.includes(resolvedParameters.get(key) ?? ""))
      throw getInvalidBlueprintError(`invalid value for parameter ${key}`);
  }
};
