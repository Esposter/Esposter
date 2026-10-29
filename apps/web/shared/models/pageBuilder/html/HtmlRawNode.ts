import type { HtmlNodeType } from "#shared/models/pageBuilder/html/HtmlNodeType";

// Markup emitted as it is, which only ever holds what the sanitiser returned
export interface HtmlRawNode {
  html: string;
  type: HtmlNodeType.Raw;
}
