// The key a files product's file has in its lock: the product's scope, then the file's key under its folder. The lock's keys
// Are these, so a change to the format is made here and in getHostedAssetFileKey alone
export const getHostedAssetLockKey = (scope: string, key: string): string => `${scope}/${key}`;
