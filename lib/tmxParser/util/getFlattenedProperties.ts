import type { TMXProperties } from "@/lib/tmxParser/models/tmx/TMXProperties";

// This flattens the properties array into key-value pairs in an object
// which lets us easily access them in the parsed tmx js object
export const getFlattenedProperties = (properties: TMXProperties) => ({
  ...properties?.map(({ property }) => ({
    ...property.map(({ $: { name, value }, _ }) => ({
      [name]: value ?? _,
    })),
  })),
});
