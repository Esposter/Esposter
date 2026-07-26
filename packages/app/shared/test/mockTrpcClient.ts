import type { Mock } from "vitest";

import { vi } from "vitest";

// The nuxt test env applies the real tRPC plugin, whose client would issue HTTP no test server answers — so
// Any test that lets a store or composable reach a procedure needs a stand-in. One auto-vivifying client
// Serves every procedure: a test names only the call it cares about, and nothing has to be re-declared per
// File. `setup.ts` installs it in place of the plugin's client for the whole suite.
const mockProcedureMap = new Map<string, Mock>();
const TRPC_PROCEDURE_METHOD_NAMES = new Set(["mutate", "query", "subscribe"]);

const getMockProcedure = (path: string) => {
  const mockProcedure = mockProcedureMap.get(path) ?? vi.fn();
  mockProcedureMap.set(path, mockProcedure);
  return mockProcedure;
};

const createMockRouterProxy = (path: string[]): unknown =>
  new Proxy(
    {},
    {
      get: (_target, property) => {
        if (typeof property !== "string") return undefined;
        // A router key nests further; a procedure method is the leaf the test drives.
        return TRPC_PROCEDURE_METHOD_NAMES.has(property)
          ? getMockProcedure([...path, property].join("."))
          : createMockRouterProxy([...path, property]);
      },
    },
  );

export const mockTrpcClient = createMockRouterProxy([]);

// The mock behind one fully-qualified procedure call, e.g. "message.createMessage.mutate". Identity is stable
// For the path, so a test can stub it before the store it drives ever resolves the client.
export const mockTrpcProcedure = (path: string): Mock => getMockProcedure(path);

export const resetMockTrpcProcedures = () => {
  for (const mockProcedure of mockProcedureMap.values()) mockProcedure.mockReset();
};
