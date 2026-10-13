import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";

// The owner-side pairing of one participant's audience row with their token, the same trust as the token CSV
export interface ProgramInvite {
  keyValue: string;
  row: Record<string, ColumnValue>;
  token: string;
}
