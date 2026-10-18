// @vitest-environment nuxt
import type { BlockDocument } from "headless-block-editor";

import { TEST_LANG } from "#shared/services/pageBuilder/constants.test";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { describe, expect, test, vi } from "vitest";

describe(usePageBuilderDocumentStore, () => {
  test("two open webpages keep their own documents", async () => {
    expect.hasAssertions();

    const firstResourceId = crypto.randomUUID();
    const secondResourceId = crypto.randomUUID();
    const firstDocument: BlockDocument = { content: [], root: { props: { lang: "" } } };
    const secondDocument: BlockDocument = { content: [], root: { props: { lang: " " } } };
    const changedDocument: BlockDocument = { content: [], root: { props: { lang: TEST_LANG } } };
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument, loadDocument, setDocument } = pageBuilderDocumentStore;
    await loadDocument(firstResourceId, () => Promise.resolve(firstDocument));
    await loadDocument(secondResourceId, () => Promise.resolve(secondDocument));
    setDocument(firstResourceId, changedDocument);

    expect(getDocument(firstResourceId)).toStrictEqual(changedDocument);
    expect(getDocument(secondResourceId)).toStrictEqual(secondDocument);
  });

  test("a save hands the writer the document held for its resource", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const document: BlockDocument = { content: [], root: { props: { lang: "" } } };
    const writeDocument = vi.fn<(document: BlockDocument) => Promise<void>>().mockResolvedValue(undefined);
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { loadDocument, saveDocument } = pageBuilderDocumentStore;
    await loadDocument(resourceId, () => Promise.resolve(document));
    await saveDocument(resourceId, writeDocument);

    expect(writeDocument).toHaveBeenCalledExactlyOnceWith(document);
  });

  test("a save writes nothing for a resource whose document is not held", async () => {
    expect.hasAssertions();

    const writeDocument = vi.fn<(document: BlockDocument) => Promise<void>>().mockResolvedValue(undefined);
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { saveDocument } = pageBuilderDocumentStore;
    await saveDocument(crypto.randomUUID(), writeDocument);

    expect(writeDocument).not.toHaveBeenCalled();
  });
});
