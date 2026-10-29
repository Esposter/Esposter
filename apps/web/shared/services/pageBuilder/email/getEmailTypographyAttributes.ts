import type { EmailTypography } from "#shared/models/pageBuilder/email/EmailTypography";

import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";

export const getEmailTypographyAttributes = ({ color, fontFamily, fontSize, lineHeight }: EmailTypography) => ({
  [ElementAttribute.Color]: color,
  [ElementAttribute.FontFamily]: fontFamily,
  [ElementAttribute.FontSize]: fontSize,
  [ElementAttribute.LineHeight]: lineHeight,
});
