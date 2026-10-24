// @vitest-environment nuxt
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { HtmlTag } from "#shared/models/pageBuilder/HtmlTag";
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_LANG, TEST_ROOT } from "#shared/services/pageBuilder/constants.test";
import { TEST_SECTION_ID } from "@/services/pageBuilder/constants.test";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { describe, expect, test, vi } from "vitest";
import { webpageKind } from "@/services/pageBuilder/webpageKind";

describe(usePageBuilderDocumentStore, () => {
  const TEST_OTHER_LANG = "fr";
  const TEST_CHANGED_LANG = "de";

  test("two open webpages keep their own documents", async () => {
    expect.hasAssertions();

    const firstResourceId = crypto.randomUUID();
    const secondResourceId = crypto.randomUUID();
    const firstDocument: WebpageDocument = { content: [], root: { props: { lang: TEST_LANG, tokens: {} } } };
    const secondDocument: WebpageDocument = { content: [], root: { props: { lang: TEST_OTHER_LANG, tokens: {} } } };
    const changedDocument: WebpageDocument = { content: [], root: { props: { lang: TEST_CHANGED_LANG, tokens: {} } } };
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument, loadDocument, setDocument } = pageBuilderDocumentStore;
    await loadDocument(firstResourceId, webpageKind, () => Promise.resolve(firstDocument));
    await loadDocument(secondResourceId, webpageKind, () => Promise.resolve(secondDocument));
    setDocument(firstResourceId, webpageKind, changedDocument);

    expect(getDocument(firstResourceId)).toStrictEqual(changedDocument);
    expect(getDocument(secondResourceId)).toStrictEqual(secondDocument);
  });

  test("a loaded document with a section that has no children is refused at load", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument, loadDocument } = pageBuilderDocumentStore;

    await expect(
      loadDocument(resourceId, webpageKind, () =>
        Promise.resolve({
          content: [{ props: { id: TEST_SECTION_ID, tag: HtmlTag.Section }, type: WebpageNodeType.Section }],
          root: TEST_ROOT,
        }),
      ),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`
      [ZodError: [
        {
          "expected": "array",
          "code": "invalid_type",
          "path": [
            "content",
            0,
            "props",
            "children"
          ],
          "message": "Invalid input: expected array, received undefined"
        }
      ]]
    `);
    expect(getDocument(resourceId)).toBeUndefined();
  });

  test("a save hands the writer the document held for its resource", async () => {
    expect.hasAssertions();

    const resourceId = crypto.randomUUID();
    const document: WebpageDocument = { content: [], root: { props: { lang: TEST_LANG, tokens: {} } } };
    const writeDocument = vi.fn<(document: WebpageDocument) => Promise<void>>().mockResolvedValue(undefined);
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { loadDocument, saveDocument } = pageBuilderDocumentStore;
    await loadDocument(resourceId, webpageKind, () => Promise.resolve(document));
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
