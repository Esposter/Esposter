// The url of every file the cache holds, so a plan can match each file of the index by the url it is kept under
export const listHeldCharacterPackUrls = async (cache: Pick<Cache, "keys">): Promise<Set<string>> => {
  const requests = await cache.keys();
  return new Set(requests.map(({ url }) => url));
};
