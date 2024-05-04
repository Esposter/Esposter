import type { TMXParsedProperties } from "@/lib/tmxParser/models/tmx/TMXParsedProperties";
import type { TMXProperties } from "@/lib/tmxParser/models/tmx/TMXProperties";

export const parseProperties = (properties: TMXProperties | undefined): TMXParsedProperties | undefined =>
  properties
    ? properties.map(({ property }) => {
        const { $, _ } = property[0];
        const { name, value } = $;
        return { name, value: value ?? _ };
      })
    : undefined;
