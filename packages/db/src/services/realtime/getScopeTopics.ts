import type { ScopeValue } from "#src/models/realtime/ScopeValue";
import type { ScopeTopic } from "@esposter/db-schema";

import { checkIsSecretColumn } from "#src/services/realtime/checkIsSecretColumn";
import { getScopeValue } from "#src/services/realtime/getScopeValue";
import { getScopeTopic } from "@esposter/db-schema";

// The scope topic of one scope value, the one spelling a read and a write name a row by. A secret column's value is
// Named by its digest, whichever side names it
export const getScopeValueTopic = async ({ column, table, value }: ScopeValue): Promise<ScopeTopic> =>
  getScopeTopic(table, column, await getScopeValue(value, checkIsSecretColumn(table, column)));

// The scope topic of each scope value, in the order the values are given
export const getScopeTopics = (scopeValues: ScopeValue[]): Promise<ScopeTopic[]> =>
  Promise.all(scopeValues.map((scopeValue) => getScopeValueTopic(scopeValue)));
