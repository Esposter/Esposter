import type { Breakpoint } from "#shared/models/pageBuilder/style/Breakpoint";
import type { NodeStyle } from "#shared/models/pageBuilder/style/NodeStyle";

import { StyleStates } from "#shared/models/pageBuilder/style/StyleState";
import { getNodeClass } from "#shared/services/pageBuilder/getNodeClass";
import { getStyleDeclarationsCss } from "#shared/services/pageBuilder/style/getStyleDeclarationsCss";
import { StyleStateSelectorMap } from "#shared/services/pageBuilder/style/StyleStateSelectorMap";

// One node's rules at one breakpoint, its default ahead of its states so a state overrides it
export const getNodeStyleCss = (id: string, style: NodeStyle, breakpoint: Breakpoint) =>
  StyleStates.map((styleState) => {
    const declarationsCss = getStyleDeclarationsCss(style[breakpoint]?.[styleState] ?? {});
    return declarationsCss ? `${StyleStateSelectorMap[styleState](`.${getNodeClass(id)}`)}{${declarationsCss}}` : "";
  }).join("");
