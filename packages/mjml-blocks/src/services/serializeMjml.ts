import type { MjmlJson } from "#src/models/MjmlJson";

// Each attribute as MJML source writes it, its value as given: the render escaped it already
const serializeAttributes = (attributes: Record<string, boolean | string>): string =>
  Object.entries(attributes)
    .map(([name, value]) => ` ${name}="${String(value)}"`)
    .join("");

// MJML source for MJML's JSON form, every element closed by its own tag, so an element that closes nothing never swallows its siblings
export const serializeMjml = (json: MjmlJson): string => {
  const attributes = serializeAttributes(json.attributes);
  if ("children" in json)
    return `<${json.tagName}${attributes}>${json.children.map((child) => serializeMjml(child)).join("")}</${json.tagName}>`;

  const content = "content" in json ? json.content : "";
  return `<${json.tagName}${attributes}>${content}</${json.tagName}>`;
};
