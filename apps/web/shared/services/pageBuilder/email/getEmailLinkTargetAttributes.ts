import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";

// MJML opens a link in a new tab unless told otherwise, so staying in the tab is written out, and a new tab gets no
// Handle back to the email
export const getEmailLinkTargetAttributes = (isNewTab: boolean) =>
  isNewTab
    ? { [ElementAttribute.Rel]: "noopener noreferrer", [ElementAttribute.Target]: "_blank" }
    : { [ElementAttribute.Target]: "_self" };
