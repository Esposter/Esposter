// The key one object is stored under in a bucket: its dataset and its content hash, so the key names the content it holds
export const getGameDataObjectKey = (dataset: string, hash: string): string => `${dataset}/${hash}.json`;
