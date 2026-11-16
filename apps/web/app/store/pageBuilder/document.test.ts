// @vitest-environment nuxt
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { TEST_LANG } from "#shared/services/pageBuilder/constants.test";
import { webpageKind } from "#src/services/pageBuilder/webpageKind";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(usePageBuilderDocumentStore, () => {
  const TEST_OTHER_LANG = "a";
  const TEST_CHANGED_LANG = "b";

  test("two open webpages keep their own documents", () => {
    expect.hasAssertions();

    const firstResourceId = v7();
    const secondResourceId = v7();
    const firstDocument: WebpageDocument = { content: [], root: { props: { lang: TEST_LANG, tokens: {} } } };
    const secondDocument: WebpageDocument = { content: [], root: { props: { lang: TEST_OTHER_LANG, tokens: {} } } };
    const changedDocument: WebpageDocument = { content: [], root: { props: { lang: TEST_CHANGED_LANG, tokens: {} } } };
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument, setDocument } = pageBuilderDocumentStore;
    setDocument(firstResourceId, webpageKind, firstDocument);
    setDocument(secondResourceId, webpageKind, secondDocument);
    setDocument(firstResourceId, webpageKind, changedDocument);

    expect(getDocument(firstResourceId)).toStrictEqual(changedDocument);
    expect(getDocument(secondResourceId)).toStrictEqual(secondDocument);
  });
});
