// An Azure Table entity as the legacy app deserialized it: its own properties with the legacy JSON-stored ones parsed back
// into arrays and objects, and Dates as Dates. The system properties (etag, timestamp) are kept apart from it
export type LegacyEntity = Record<string, unknown> & { partitionKey: string; rowKey: string };
