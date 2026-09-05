import { signOutOfBrowser } from "@/services/auth/signOutOfBrowser";
import { RoutePath } from "@esposter/shared";
import { beforeEach, describe, expect, test, vi } from "vitest";

// `authClient` is a better-auth dynamic-path Proxy, so signOut is not a configurable own property and cannot be
// Spied on directly — mock the module and drive signOut through a hoisted mock instead
const { signOutMock } = vi.hoisted(() => ({ signOutMock: vi.fn<() => Promise<void>>() }));

vi.mock(import("@/services/auth/authClient"), () => ({
  authClient: { signOut: signOutMock } as unknown as (typeof import("@/services/auth/authClient"))["authClient"],
}));

describe(signOutOfBrowser, () => {
  const reloadMock = vi.fn<() => void>();

  beforeEach(() => {
    vi.stubGlobal("window", { location: { href: "", reload: reloadMock } });
  });

  test("lands on the given path", async () => {
    expect.hasAssertions();

    signOutMock.mockResolvedValue();
    await signOutOfBrowser(RoutePath.Login);

    expect(window.location.href).toBe(RoutePath.Login);
    expect(reloadMock).not.toHaveBeenCalled();
  });

  test("reloads in place when given no path", async () => {
    expect.hasAssertions();

    signOutMock.mockResolvedValue();
    await signOutOfBrowser();

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  // The session is already gone server-side by the time a caller reaches here, so a cookie clear that fails
  // Must not be what strands the reader on a page still drawn as signed in
  test("loads anyway when signing out fails", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    signOutMock.mockRejectedValue(new Error("network"));
    await signOutOfBrowser(RoutePath.Login);

    expect(window.location.href).toBe(RoutePath.Login);
  });
});
