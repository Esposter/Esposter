// @vitest-environment nuxt
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { TEST_LANG } from "#shared/services/pageBuilder/constants.test";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { describe, expect, test, vi } from "vitest";

describe(usePageBuilderDocumentStore, () => {
  const TEST_OTHER_LANG = "fr";
  const TEST_CHANGED_LANG = "de";

  test("two open webpages keep their own documents", () => {
    expect.hasAssertions();

    const firstResourceId = crypto.randomUUID();
    const secondResourceId = crypto.randomUUID();
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

  test("a save hands the writer the document held for its resource", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const document: WebpageDocument = { content: [], root: { props: { lang: TEST_LANG, tokens: {} } } };
    const writeDocument = vi.fn<(document: WebpageDocument) => Promise<void>>().mockResolvedValue(undefined);
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { saveDocument, setDocument } = pageBuilderDocumentStore;
    setDocument(resourceId, webpageKind, document);
    await saveDocument(resourceId, writeDocument);

    expect(writeDocument).toHaveBeenCalledExactlyOnceWith(document);
  });

  test("a save writes nothing for a resource whose document is not held", async () => {
    expect.hasAssertions();

    const writeDocument = vi.fn<(document: WebpageDocument) => Promise<void>>().mockResolvedValue(undefined);
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { saveDocument } = pageBuilderDocumentStore;
    await saveDocument(crypto.randomUUID(), writeDocument);

    expect(writeDocument).not.toHaveBeenCalled();
  });
});
