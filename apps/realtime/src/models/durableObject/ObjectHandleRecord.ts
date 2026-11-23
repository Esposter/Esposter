import type { RecordedDatabase } from "@esposter/db";

// The recorder of one handle in an invocation. An owned handle is the object's own database, whose rows belong to the
// Object Alone, so its topics name the object
export interface ObjectHandleRecord {
  owned: boolean;
  recorder: RecordedDatabase;
}
