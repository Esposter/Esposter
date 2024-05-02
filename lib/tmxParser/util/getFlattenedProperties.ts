import type { TMXNode } from "@/lib/tmxParser/models/tmx/TMXNode";
// This flattens the properties array into key-value pairs in an object
// which lets us easily access them in the parsed tmx js object
export const getFlattenedProperties = (properties: TMXNode<unknown>["properties"] | undefined) => ({
  ...properties?.map(({ property }) => ({
    ...property.map(({ $: { name, value }, _ }) => ({
      [name]: value ?? _,
    })),
  })),
});
