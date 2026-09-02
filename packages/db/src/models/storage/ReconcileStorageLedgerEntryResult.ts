import type { User } from "@esposter/db-schema";

// Two answers a reconcile owes its caller, and they are not the same question. A caller holding an ambiguous
// Blob name retries on `isMatched`, while only a counter that actually moved is worth telling anyone about —
// A redelivery, a stale event and a charge an event has already superseded all match a row and change nothing.
export interface ReconcileStorageLedgerEntryResult {
  // The owner whose `storageBytesUsed` changed, absent when the write settled to the figure already counted
  chargedUserId?: User["id"];
  // Whether a ledger row existed for this container and blob name at all
  isMatched: boolean;
}
