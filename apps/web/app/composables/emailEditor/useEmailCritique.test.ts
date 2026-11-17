// @vitest-environment nuxt
import type { EmailDocument } from "#src/models/pageBuilder/EmailDocument";

import {
  TEST_ID,
  TEST_LABEL,
  TEST_OTHER_ID,
  TEST_THIRD_ID,
  TEST_URL,
} from "#shared/services/pageBuilder/constants.test";
import { EditorFindingSeverity } from "#src/models/editor/EditorFindingSeverity";
import { emailKind } from "#src/services/pageBuilder/emailKind";
import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "#src/services/resource/constants";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { MjmlNodeType } from "mjml-blocks";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

// A section holding one column, which holds a button whose address is written when given
const createDocument = (href: string | undefined): EmailDocument => ({
  content: [
    {
      props: {
        children: [
          {
            props: {
              children: [
                {
                  props: { content: TEST_LABEL, id: TEST_ID, ...(href === undefined ? {} : { href }) },
                  type: MjmlNodeType.Button,
                },
              ],
              id: TEST_OTHER_ID,
            },
            type: MjmlNodeType.Column,
          },
        ],
        id: TEST_THIRD_ID,
      },
      type: MjmlNodeType.Section,
    },
  ],
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
