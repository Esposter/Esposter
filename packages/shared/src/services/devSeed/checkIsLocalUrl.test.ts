import { checkIsLocalUrl } from "#src/services/devSeed/checkIsLocalUrl";
import { describe, expect, test } from "vitest";

describe(checkIsLocalUrl, () => {
  test.each(["localhost", "127.0.0.1", "[::1]"])("a loopback address %s is local", (hostname) => {
    expect.hasAssertions();
    expect(checkIsLocalUrl(`postgres://${hostname}`)).toBe(true);
  });

  test("a remote host is not local", () => {
    expect.hasAssertions();
    expect(checkIsLocalUrl("postgres://remote.example")).toBe(false);
  });

  // The postgres driver prefers a host parameter to the authority, so a loopback authority carrying one reaches
  // A remote host
  test.each(["host", "hostaddr"])("a loopback authority with a %s parameter is not local", (parameterName) => {
    expect.hasAssertions();
    expect(checkIsLocalUrl(`postgres://localhost?${parameterName}=remote.example`)).toBe(false);
  });

  // The URL standard starts a fragment at the first hash, while the postgres driver reads the authority up to a slash or a
  // Question mark, so a fragment can hide a remote host after a loopback one
  test("a loopback authority with a fragment is not local", () => {
    expect.hasAssertions();
    expect(checkIsLocalUrl("postgres://localhost#@remote.example/a")).toBe(false);
  });

  test("an unparsable string is not local", () => {
    expect.hasAssertions();
    expect(checkIsLocalUrl("not a url")).toBe(false);
  });
});
