// A Cache Storage that holds its responses in memory, for the suites that read and write a product's files through a cache.
// It is a subpath of its own, so the barrel does not export it, and a sibling package's suites import it by that subpath
export const createHostedAssetCacheStub = (): Pick<Cache, "delete" | "keys" | "match" | "put"> => {
  const responses = new Map<string, Response>();
  return {
    delete: (url: string | URL) => Promise.resolve(responses.delete(String(url))),
    keys: () => Promise.resolve(Array.from(responses.keys(), (url) => new Request(url))),
    match: (url: string | URL) => Promise.resolve(responses.get(String(url))?.clone()),
    put: (url: string | URL, response: Response) => {
      responses.set(String(url), response);
      return Promise.resolve();
    },
  };
};
