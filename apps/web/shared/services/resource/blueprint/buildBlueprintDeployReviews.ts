import type { BlueprintEntry } from "#shared/models/resource/blueprint/BlueprintEntry";

import { blueprintEntrySchema } from "#shared/models/resource/blueprint/BlueprintEntry";
import {
  BLUEPRINT_ENTRY_TOKEN_REGEX,
  BLUEPRINT_PARAMETER_TOKEN_REGEX,
} from "#shared/services/resource/blueprint/constants";
import { visitBlueprintEntryContentStrings } from "#shared/services/resource/blueprint/mapBlueprintEntryContentStrings";
import { substituteBlueprintParameterTokens } from "#shared/services/resource/blueprint/substituteBlueprintParameterTokens";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";

// What each entry will be created as, resolved from the parameter values by the same substitution deploy runs,
// So the review cannot show a name deploy would not create. An empty name blocks the deploy and is shown by its alias
export const buildBlueprintDeployReviews = (entries: BlueprintEntry[], parameterValues: Record<string, string>) => {
  const parameterValueMap = new Map(Object.entries(parameterValues));

  return entries.map((entry) => {
    const name = substituteBlueprintParameterTokens(entry.name, parameterValueMap);
    const bindingKeys = new Set<string>();
    visitBlueprintEntryContentStrings(entry, (value) => {
      for (const { groups } of value.matchAll(BLUEPRINT_ENTRY_TOKEN_REGEX)) bindingKeys.add(groups?.key ?? "");
    });
    const undeclaredTokens = name.match(BLUEPRINT_PARAMETER_TOKEN_REGEX) ?? [];
    const isNameEmpty = !blueprintEntrySchema.shape.name.safeParse(name).success;
    const notes: string[] = [];
    if (bindingKeys.size > 0) notes.push(`binds ${[...bindingKeys].join(", ")}`);
    if (undeclaredTokens.length > 0) notes.push(`undeclared ${undeclaredTokens.join(", ")}`);
    if (isNameEmpty) notes.push("no name: a parameter it uses is empty");

    return {
      description: notes.join(" · "),
      icon: ResourceDefinitionMap[entry.type].icon,
      isNameEmpty,
      key: entry.key,
      title: isNameEmpty ? entry.key : name,
    };
  });
};
