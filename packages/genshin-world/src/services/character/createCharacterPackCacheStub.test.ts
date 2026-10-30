import { describe } from "vitest";

// A Cache Storage that holds its responses in memory, for the suites that read and write a pack's files through a cache
export const createCharacterPackCacheStub = (): Pick<Cache, "keys" | "match" | "put"> => {
  const responses = new Map<string, Response>();
  return {
    keys: async () => Array.from(responses.keys(), (url) => new Request(url)),
    match: async (url) => responses.get(String(url))?.clone(),
    put: async (url, response) => {
      responses.set(String(url), response);
    },
  };
};

describe.todo("createCharacterPackCacheStub");
