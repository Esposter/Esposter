// @vitest-environment nuxt
import type { EmailDocument } from "#src/models/pageBuilder/EmailDocument";

import { TEST_ID, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { EditorFindingSeverity } from "#src/models/editor/EditorFindingSeverity";
import { createEmailButtonSection } from "#src/services/pageBuilder/email/createEmailButtonSection.test";
import { emailKind } from "#src/services/pageBuilder/emailKind";
import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "#src/services/resource/constants";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

const createDocument = (href: string | undefined): EmailDocument => ({
  content: [createEmailButtonSection(href)],
  root: { props: { lang: "", title: "" } },
});

describe("useEmailCritique", () => {
  test("the findings follow an unsaved edit", async () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { setEmailDocument } = pageBuilderDocumentStore;
    setEmailDocument(resourceId, emailKind, createDocument(TEST_URL));
    const findings = useEmailCritique(resourceId);

    expect(findings.value).toStrictEqual([]);

    vi.useFakeTimers({ now: 0 });
    setEmailDocument(resourceId, emailKind, createDocument(undefined));
    await vi.advanceTimersByTimeAsync(RESOURCE_AUTOSAVE_DEBOUNCE_MS);
    vi.useRealTimers();

    expect(findings.value.map(({ nodeId, severity }) => ({ nodeId, severity }))).toStrictEqual([
      { nodeId: TEST_ID, severity: EditorFindingSeverity.Warning },
    ]);
  });
});
