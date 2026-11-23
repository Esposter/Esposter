import type { ObjectNamespace } from "#src/models/realtime/ObjectNamespace";
import type { ColumnTopic } from "@esposter/db-schema";

import { createObjectStub } from "#src/services/realtime/createObjectStub";

// A Durable Object reached by its name, as a stub whose RPC methods each run through the object's `invoke`. It is the one way a
// Worker names an object: a stub made any other way is not wrapped, so its reads are not recorded and its writes not published
export const getObjectStub = <TStub extends object, TId>(
  namespace: ObjectNamespace<TStub, TId>,
  name: string,
  onReadSet?: (readSet: ColumnTopic[]) => void,
): TStub =>
  // oxlint-disable-next-line selector-ban/no-restricted-syntax -- the one place an object is named by its namespace, so every stub is wrapped here
  createObjectStub(namespace.get(namespace.idFromName(name)), onReadSet);
