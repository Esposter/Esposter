import type { HtmlNodeType } from "#shared/models/pageBuilder/html/HtmlNodeType";

// Escaped once, by the serialiser
export interface HtmlTextNode {
  text: string;
  type: HtmlNodeType.Text;
}
