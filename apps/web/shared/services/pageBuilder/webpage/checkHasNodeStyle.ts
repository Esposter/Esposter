import type { NodeStyle } from "#shared/models/pageBuilder/style/NodeStyle";

export const checkHasNodeStyle = (style: NodeStyle) =>
  Object.values(style).some((stateDeclarationsMap) =>
    Object.values(stateDeclarationsMap).some((declarations) => Object.keys(declarations).length > 0),
  );
