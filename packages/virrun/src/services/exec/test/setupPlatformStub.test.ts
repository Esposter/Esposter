import { afterEach, describe } from "vitest";
// Registers the `process.platform` stub behind every suite that drives a platform branch: the returned setter
// Redefines the property for one case, and the real platform is put back after each test. `process.platform` is a
// Property of a global rather than a global, so `vi.stubGlobal` cannot reach it and the definition is done by hand
// Here, once.
export const setupPlatformStub = (): ((platform: NodeJS.Platform) => void) => {
  const realPlatform = process.platform;
  const stubPlatform = (platform: NodeJS.Platform): void => {
    Object.defineProperty(process, "platform", { configurable: true, value: platform });
  };

  afterEach(() => {
    stubPlatform(realPlatform);
  });

  return stubPlatform;
};

describe.todo("setupPlatformStub");
