// The file's key under its folder, read back from its key in the lock: the inverse of getHostedAssetLockKey
export const getHostedAssetFileKey = (scope: string, lockKey: string): string => lockKey.slice(scope.length + 1);
