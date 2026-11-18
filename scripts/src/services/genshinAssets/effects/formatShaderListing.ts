import type { ShaderListing } from "#src/models/genshinAssets/effects/ShaderListing";

import { formatStateValue } from "#src/services/genshinAssets/effects/formatStateValue";

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
        formatStateValue("source", blend.source),
        formatStateValue("destination", blend.destination),
        formatStateValue("operation", blend.operation),
        formatStateValue("colorMask", blend.colorMask),
        "|",
        formatStateValue("zTest", depth.zTest),
        formatStateValue("zWrite", depth.zWrite),
        formatStateValue("cull", depth.cull),
      ].join(" "),
    ),
  ];
};
