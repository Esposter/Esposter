import { describe } from "vitest";

// A Cache Storage that holds its responses in memory, for the suites that read and write a pack's files through a cache
export const createCharacterPackCacheStub = (): Pick<Cache, "keys" | "match" | "put"> => {
  const responses = new Map<string, Response>();
  return {
    keys: () => Promise.resolve(Array.from(responses.keys(), (url) => new Request(url))),
    match: (url: string | URL) => Promise.resolve(responses.get(String(url))?.clone()),
    put: (url: string | URL, response) => {
      responses.set(String(url), response);
      return Promise.resolve();
    },
  };
};

describe.todo("createCharacterPackCacheStub");
