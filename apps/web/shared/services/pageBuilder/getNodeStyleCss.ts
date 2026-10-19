import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";
import type { WebpageNodeDefinition } from "#shared/models/pageBuilder/WebpageNodeDefinition";

import { StyleBreakpoint } from "#shared/models/pageBuilder/StyleBreakpoint";
import { StyleState } from "#shared/models/pageBuilder/StyleState";
import {
  MOBILE_BREAKPOINT_WIDTH,
  STYLE_PROPERTY_NAMES,
  TABLET_BREAKPOINT_WIDTH,
} from "#shared/services/pageBuilder/constants";
import { getNodeStyleClass } from "#shared/services/pageBuilder/getNodeStyleClass";

// Each breakpoint's media query in cascade order, the base having none, so a narrower override comes after a wider one
const BREAKPOINT_MEDIA_QUERIES = [
  [StyleBreakpoint.Base, undefined],
  [StyleBreakpoint.Tablet, `(max-width: ${TABLET_BREAKPOINT_WIDTH}px)`],
  [StyleBreakpoint.Mobile, `(max-width: ${MOBILE_BREAKPOINT_WIDTH}px)`],
] as const;

// The rules of one node's style, a rule per breakpoint and state that sets any property. On a focusable node the hover
// Rule also matches keyboard focus, so the hover style is not mouse-only
export const getNodeStyleCss = (node: WebpageNode, definition: WebpageNodeDefinition): string => {
  const { style } = node.props;
  if (!style) return "";

  const selector = `.${getNodeStyleClass(node)}`;
  const selectors = {
    [StyleState.Default]: selector,
    [StyleState.Hover]: definition.isFocusable ? `${selector}:hover, ${selector}:focus-visible` : `${selector}:hover`,
  } satisfies Record<StyleState, string>;

  return BREAKPOINT_MEDIA_QUERIES.flatMap(([breakpoint, mediaQuery]) =>
    Object.values(StyleState).flatMap((state) => {
      const declarations = STYLE_PROPERTY_NAMES.flatMap((property) => {
        const value = style[breakpoint]?.[state]?.[property];
        return value ? [`  ${property}: ${value};`] : [];
      });
      if (declarations.length === 0) return [];

      const rule = [`${selectors[state]} {`, ...declarations, "}"].join("\n");
      return [mediaQuery ? `@media ${mediaQuery} {\n  ${rule.replaceAll("\n", "\n  ")}\n}` : rule];
    }),
  ).join("\n");
};
