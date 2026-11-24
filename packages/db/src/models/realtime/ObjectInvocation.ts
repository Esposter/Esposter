import type { ColumnTopic } from "@esposter/db-schema";

// What an object's `invoke` answers: the method's result, the read set its reads watch, and the write set the object
// Has already published for its writes. The caller unwraps the result, and records the read set where it watches
export interface ObjectInvocation<TResult = unknown> {
  readSet: ColumnTopic[];
  result: TResult;
  writeSet: ColumnTopic[];
}
