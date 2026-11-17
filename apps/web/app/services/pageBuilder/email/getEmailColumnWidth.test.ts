import { getEmailColumnWidth } from "#src/services/pageBuilder/email/getEmailColumnWidth";
import { describe, expect, test } from "vitest";

describe(getEmailColumnWidth, () => {
  test("a body width sets the width of the email", () => {
    expect.hasAssertions();

    const width = getEmailColumnWidth({
      content: [],
      root: { props: { body: { width: "480px" }, lang: "", title: "" } },
    });

    expect(width).toBe("480px");
  });
});
