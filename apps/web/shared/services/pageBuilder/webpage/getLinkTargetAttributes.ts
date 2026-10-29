import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";

// A link opening a tab of its own gives the page it opens no handle back to this one
export const getLinkTargetAttributes = (isNewTab: boolean) =>
  isNewTab ? { [ElementAttribute.Rel]: "noopener noreferrer", [ElementAttribute.Target]: "_blank" } : {};
