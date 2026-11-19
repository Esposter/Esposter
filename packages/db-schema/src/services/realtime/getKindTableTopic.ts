import type { ScopeTopic } from "#src/models/realtime/Topic";

// The table-wide topic of a table across every object of a kind, `<kind>/*:<table>:*`. Each object publishes it for each table its own
// Writes change, beside its own `<kind>/<id>:<table>:*`, so a read that names many objects' tables collapses to this one topic
export const getKindTableTopic = (kind: string, tableName: string): ScopeTopic => `${kind}/*:${tableName}:*`;
