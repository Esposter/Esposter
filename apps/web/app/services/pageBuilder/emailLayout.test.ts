import { emailLayout } from "@/services/pageBuilder/emailLayout";
import {
  PAGE_BUILDER_CONTENT_KEY_MAP,
  PAGE_BUILDER_SELECTION_KIND_MAP,
} from "@/services/pageBuilder/pageBuilderLayout";
import { describe, expect, test } from "vitest";
import { checkLayout } from "vue-editor-layout-headless";

describe("emailLayout", () => {
  test("the email's layout passes the layout check", () => {
    expect.hasAssertions();

    const findings = checkLayout(
      emailLayout.layout,
      Object.values(PAGE_BUILDER_SELECTION_KIND_MAP),
      Object.values(PAGE_BUILDER_CONTENT_KEY_MAP),
    );

    expect(findings).toStrictEqual([]);
  });
});
