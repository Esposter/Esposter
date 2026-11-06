import type { FindingKind } from "#src/models/FindingKind";

// One thing a layout check reports, and the id, selection kind or content key it names
export interface Finding {
  kind: FindingKind;
  subject: string;
}
