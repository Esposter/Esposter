import type { ShaderListing } from "#src/models/genshinAssets/effects/ShaderListing";
import type { SerializedShaderFloat } from "#src/models/genshinAssets/materials/SerializedShaderFloat";

// A value as its label and its number, and the property that drives it where one does, or "literal" where the shader
// Sets it itself
const formatValue = (label: string, { name, value }: SerializedShaderFloat): string =>
  `${label}=${value} (${name === "" ? "literal" : name})`;

// A shader's header and one line per pass: its blend and depth state, each value named by the property that drives it.
// A shader whose serialized form does not read says so, with no state read from it
export const formatShaderListing = ({
  block,
  folder,
  isEffect,
  isRead,
  keywords,
  name,
  passes,
}: ShaderListing): string[] => {
  const header = `${block}/${folder} "${name}"${isEffect ? " effect" : ""}`;
  if (!isRead) return [header, "  serialized form not read: no blend or depth state"];
  return [
    header,
    `  keywords: ${keywords.length > 0 ? keywords.join(" ") : "none"}`,
    ...passes.map(({ name: passName, state: { blend, depth } }) =>
      [
        `  pass "${passName}":`,
        formatValue("source", blend.source),
        formatValue("destination", blend.destination),
        formatValue("operation", blend.operation),
        formatValue("colorMask", blend.colorMask),
        "|",
        formatValue("zTest", depth.zTest),
        formatValue("zWrite", depth.zWrite),
        formatValue("cull", depth.cull),
      ].join(" "),
    ),
  ];
};
