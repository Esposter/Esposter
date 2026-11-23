// The key a files product's file has in its lock: the product's scope, then the file's key under its folder
// Every lock key is built this way, so a change to the format is made here and in hosted-assets' getHostedAssetFileKey alone
export const getHostedAssetLockKey = (scope: string, key: string): string => `${scope}/${key}`;
