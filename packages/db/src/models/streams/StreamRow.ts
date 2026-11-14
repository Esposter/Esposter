// A row as D1 returns it: the two keys, the etag and the entity's other properties in their JSON form
export interface StreamRow {
  entity: Record<string, unknown>;
  etag: string;
  partitionKey: string;
  rowKey: string;
}
