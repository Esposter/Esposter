import { NODE_GROUP_PREFIX, NODE_SHADOW_DEFINITION, NODE_SHADOW_ID } from "#scripts/dependencyGraph/constants";

// Graphviz has no shadow attribute, so the depth the `box3d` fold only suggests is finished off in the svg it
// Emits. The filter goes on the face polygon alone — the fold polylines and the label sit inside that
// Silhouette, so shadowing the whole group would only blur the text — and the flood colour is near-black at low
// Opacity, which lifts the node off a white page and disappears against a dark one rather than ringing it.
export const getShadowedSvg = (svg: string): string =>
  svg
    .replace('<g id="graph0"', `${NODE_SHADOW_DEFINITION}<g id="graph0"`)
    .split(NODE_GROUP_PREFIX)
    .map((section, index) =>
      index === 0 ? section : section.replace("<polygon ", `<polygon filter="url(#${NODE_SHADOW_ID})" `),
    )
    .join(NODE_GROUP_PREFIX);
