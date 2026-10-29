import type { EmailSectionLayout } from "#shared/models/pageBuilder/email/EmailSectionLayout";

import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";

export const getEmailSectionLayoutAttributes = ({
  backgroundColor,
  backgroundUrl,
  isFullWidth,
  padding,
  textAlign,
}: EmailSectionLayout) => ({
  [ElementAttribute.BackgroundColor]: backgroundColor,
  [ElementAttribute.BackgroundUrl]: backgroundUrl,
  [ElementAttribute.FullWidth]: isFullWidth ? "full-width" : "",
  [ElementAttribute.Padding]: padding,
  [ElementAttribute.TextAlign]: textAlign,
});
