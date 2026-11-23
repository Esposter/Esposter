// A file's key under its scope, cut from its lock key, which is `<scope>/<key>`
// It is the inverse of the lock key a files product builds from the scope and the key
export const getHostedAssetFileKey = (scope: string, lockKey: string): string => lockKey.slice(scope.length + 1);
