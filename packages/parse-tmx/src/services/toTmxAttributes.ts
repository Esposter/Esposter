import type { TMXAttributes } from "#src/models/tmx/TMXAttributes";
import type { QualifiedAttribute } from "sax";

// Sax types an attribute as its value, or as the qualified attribute that wraps it when namespaces are read. This reader
// Reads no namespaces, so every attribute is the value it holds.
export const toTmxAttributes = (attributes: Record<string, QualifiedAttribute | string>): TMXAttributes =>
  Object.fromEntries(
    Object.entries(attributes).map(([name, attribute]) => [
      name,
      typeof attribute === "string" ? attribute : attribute.value,
    ]),
  );
