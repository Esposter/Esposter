// The `[name, lockKey]` pairs a product's lock keys render under, each name derived from its lock key by `toName`
export const getHostedAssetKeyPairs = (
  lockKeys: string[],
  toName: (lockKey: string) => string,
): [name: string, lockKey: string][] => lockKeys.map((lockKey) => [toName(lockKey), lockKey]);
