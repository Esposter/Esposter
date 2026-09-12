import { signOut } from "@/services/auth/authClient.test";
import { signOutOfBrowser } from "@/services/auth/signOutOfBrowser";
import { RoutePath } from "@esposter/shared";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe(signOutOfBrowser, () => {
  const reloadMock = vi.fn<() => void>();

  beforeEach(() => {
    vi.stubGlobal("window", { location: { href: "", reload: reloadMock } });
  });

  test("lands on the given path", async () => {
    expect.hasAssertions();

    signOut.mockResolvedValue();
    await signOutOfBrowser(RoutePath.Login);

    expect(window.location.href).toBe(RoutePath.Login);
    expect(reloadMock).not.toHaveBeenCalled();
  });

  test("reloads in place when given no path", async () => {
    expect.hasAssertions();

    signOut.mockResolvedValue();
    await signOutOfBrowser();

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  // The session is already gone server-side by the time a caller reaches here, so a cookie clear that fails
  // Must not be what strands the reader on a page still drawn as signed in
  test("loads anyway when signing out fails", async () => {
    expect.hasAssertions();

    vi.spyOn(console, "error").mockImplementation(() => {});
    signOut.mockRejectedValue(new Error("network"));
    await signOutOfBrowser(RoutePath.Login);

    expect(window.location.href).toBe(RoutePath.Login);
  });
});
