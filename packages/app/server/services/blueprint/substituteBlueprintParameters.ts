import { BLUEPRINT_PARAMETER_TOKEN_REGEX } from "#shared/services/resource/blueprint/constants";
import { deepReplaceStrings } from "@@/server/services/blueprint/deepReplaceStrings";

// Replaces every `{{parameter:key}}` with its resolved deploy-time value; an unknown key is left as its
// Raw token so a missing parameter surfaces at validation rather than silently vanishing from the content
export const substituteBlueprintParameters = (value: unknown, parameterValues: Record<string, string>): unknown =>
  deepReplaceStrings(value, (string) =>
    string.replace(BLUEPRINT_PARAMETER_TOKEN_REGEX, (match, key: string) => parameterValues[key] ?? match),
  );
