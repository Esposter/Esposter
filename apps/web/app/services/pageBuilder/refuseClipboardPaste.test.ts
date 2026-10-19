import { PageBuilderEditor } from "@/models/pageBuilder/PageBuilderEditor";
import { refuseClipboardPaste } from "@/services/pageBuilder/refuseClipboardPaste";
import { describe, expect, test } from "vitest";

describe(refuseClipboardPaste, () => {
  test("a webpage node pasted into an email is refused with a message", () => {
    expect.hasAssertions();

    expect(refuseClipboardPaste({ source: PageBuilderEditor.Webpage, target: PageBuilderEditor.Email })).toBe(
      "A webpage block cannot be pasted into an email",
    );
  });

  test("a webpage node pasted into a webpage is not refused", () => {
    expect.hasAssertions();

    expect(
      refuseClipboardPaste({ source: PageBuilderEditor.Webpage, target: PageBuilderEditor.Webpage }),
    ).toBeUndefined();
  });
});
