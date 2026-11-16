import { requireAuthData } from "#src/services/auth/requireAuthData";
import { describe, expect, test } from "vitest";

describe(requireAuthData, () => {
  test("resolves to the data of a successful response", async () => {
    expect.hasAssertions();

    await expect(requireAuthData(Promise.resolve({ data: "", error: null }))).resolves.toBe("");
  });

  // The api's own sentence tells the reader what to do, so it is raised ahead of the http status text
  test("rejects with the api's message rather than the status text", async () => {
    expect.hasAssertions();

    await expect(
      requireAuthData(Promise.resolve({ data: null, error: { message: " ", statusText: "" } })),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);
  });

  test("rejects with the status text when the api gives no message", async () => {
    expect.hasAssertions();

    await expect(
      requireAuthData(Promise.resolve({ data: null, error: { statusText: " " } })),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error:  ]`);
  });
});
