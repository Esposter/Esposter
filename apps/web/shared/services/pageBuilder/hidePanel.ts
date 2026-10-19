import type { HtmlNode } from "#shared/models/pageBuilder/HtmlNode";

// Every panel but the first starts hidden, as a tab that is not selected does
export const hidePanel = (panel: HtmlNode): HtmlNode =>
  typeof panel === "object" && "tag" in panel ? { ...panel, attributes: { ...panel.attributes, hidden: "" } } : panel;
