// One object as it is stored: the sha256 of its compact JSON, which is its name, and the JSON itself
export interface GameDataRecord {
  hash: string;
  isIndex: boolean;
  json: string;
}
