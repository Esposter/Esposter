import { afterEach, describe } from "vitest";
// `process.platform` is a property of a global rather than a global, so `vi.stubGlobal` cannot reach it and the
// Definition is done by hand here, once
const stubPlatform = (platform: NodeJS.Platform): void => {
  Object.defineProperty(process, "platform", { configurable: true, value: platform });
};
// Registers the `process.platform` stub behind every suite that drives a platform branch: the returned setter
// Redefines the property for one case, and the real platform is put back after each test.
export const setupPlatformStub = (): ((platform: NodeJS.Platform) => void) => {
  const realPlatform = process.platform;

  afterEach(() => {
    stubPlatform(realPlatform);
  });

  return stubPlatform;
};

describe.todo("setupPlatformStub");
