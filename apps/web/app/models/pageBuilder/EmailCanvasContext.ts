import type { EmailKind } from "@/models/pageBuilder/EmailKind";

// What a drawing reads besides its own node: its attributes resolved through the MJML cascade, its drawn children, and the
// Email's kind and width state a section lays its columns out by
export interface EmailCanvasContext {
  attribute: (name: string) => string;
  childNodes: VNode[];
  isStacked: boolean;
  kind: EmailKind;
  style: Record<string, string>;
}
