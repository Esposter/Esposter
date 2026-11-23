// The path one hosted object is stored at under its dataset, named by its hash, so the path names the content it holds
export const getGameDataObjectPath = (dataset: string, hash: string): string => `${dataset}/${hash}.json`;
