// The name a package's verdict is cached under: a version change asks GitHub again, and nothing else does
export const getSupersessionCacheKey = (packageName: string, version: string): string => `${packageName}@${version}`;
