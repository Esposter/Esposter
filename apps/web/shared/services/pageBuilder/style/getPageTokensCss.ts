import type { PageTokens } from "#shared/models/pageBuilder/style/PageTokens";

import { getColorTokenProperty } from "#shared/services/pageBuilder/style/getColorTokenProperty";
import { getFontTokenProperty } from "#shared/services/pageBuilder/style/getFontTokenProperty";

export const getPageTokensCss = ({ colors, fonts }: PageTokens) => {
  const declarations = [
    ...Object.entries(colors).map(([name, value]) => `${getColorTokenProperty(name)}:${value}`),
    ...Object.entries(fonts).map(([name, value]) => `${getFontTokenProperty(name)}:${value}`),
  ];
  return declarations.length > 0 ? `:root{${declarations.join(";")}}` : "";
};
