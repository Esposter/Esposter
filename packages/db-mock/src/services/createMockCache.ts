// A Cache Storage that holds its responses in memory, for the suites that read and write a hosted product's files
// Through a cache. It lives here rather than in the package that holds the cache, so the suites of two packages share
// It and no published package ships it
export const createMockCache = (): Pick<Cache, "delete" | "keys" | "match" | "put"> => {
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
