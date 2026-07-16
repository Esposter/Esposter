import { escapeHtml } from "@/util/text/escapeHtml";
import { describe, expect, test } from "vitest";

describe(escapeHtml, () => {
  test("escapes html special characters", () => {
    expect.hasAssertions();

    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });

  test("leaves plain text unchanged", () => {
    expect.hasAssertions();

    expect(escapeHtml("a")).toBe("a");
    expect(escapeHtml("")).toBe("");
  });
});
