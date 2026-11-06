import type { EditSessionSelection } from "#src/models/EditSessionSelection";

import { useEditSession } from "#src/composables/useEditSession";
import { createHistory, pushHistory } from "@esposter/shared";
import { describe, expect, test } from "vitest";
import { ref } from "vue";

interface TestDocument {
  items: { id: string }[];
}

const getPointer = (index: number) => `/items/${index}`;
const createDocument = (...ids: string[]): TestDocument => ({ items: ids.map((id) => ({ id })) });

describe(useEditSession, () => {
  const TEST_ID = crypto.randomUUID();
  const TEST_OTHER_ID = crypto.randomUUID();
  const TEST_LABEL = "a";
  const TEST_LIMIT = 1;
  const selection: EditSessionSelection<TestDocument> = {
    getIdByPointer: (document, nodePointer) =>
      document.items.find((_item, index) => getPointer(index) === nodePointer)?.id ?? "",
    getPointerById: (document, id) => {
      const index = document.items.findIndex((item) => item.id === id);
      return index === -1 ? "" : getPointer(index);
    },
  };

  test("a commit sets the document and the history together", () => {
    expect.hasAssertions();

    const document = ref(createDocument(TEST_ID, TEST_OTHER_ID));
    const { commit, history } = useEditSession<TestDocument, string>(document, TEST_LIMIT);
    const newDocument = createDocument(TEST_OTHER_ID);
    const newHistory = pushHistory(createHistory<string>(TEST_LIMIT), TEST_LABEL);
    commit(newDocument, newHistory);

    expect(document.value).toStrictEqual(newDocument);
    expect(history.value).toStrictEqual(newHistory);
  });

  test("a load clears the history and the selection", () => {
    expect.hasAssertions();

    const document = ref(createDocument(TEST_ID));
    const { commit, history, load, selectedPointer } = useEditSession<TestDocument, string>(
      document,
      TEST_LIMIT,
      selection,
    );
    commit(document.value, pushHistory(createHistory<string>(TEST_LIMIT), TEST_LABEL));
    selectedPointer.value = getPointer(0);
    // A content load sets the document from outside the session, which starts a fresh history on its own
    document.value = createDocument(TEST_OTHER_ID);

    expect(history.value).toStrictEqual(createHistory<string>(TEST_LIMIT));

    commit(document.value, pushHistory(createHistory<string>(TEST_LIMIT), TEST_LABEL));
    load(createDocument(TEST_OTHER_ID));

    expect(history.value).toStrictEqual(createHistory<string>(TEST_LIMIT));
    expect(selectedPointer.value).toBe("");
  });

  test("a move keeps the node selected", () => {
    expect.hasAssertions();

    const document = ref(createDocument(TEST_ID, TEST_OTHER_ID));
    const { commit, selectedPointer } = useEditSession<TestDocument, string>(document, TEST_LIMIT, selection);
    selectedPointer.value = getPointer(1);
    commit(createDocument(TEST_OTHER_ID, TEST_ID), createHistory<string>(TEST_LIMIT));

    expect(selectedPointer.value).toBe(getPointer(0));
  });

  test("a selection of a removed node reads as nothing selected", () => {
    expect.hasAssertions();

    const document = ref(createDocument(TEST_ID, TEST_OTHER_ID));
    const { commit, selectedPointer } = useEditSession<TestDocument, string>(document, TEST_LIMIT, selection);
    selectedPointer.value = getPointer(0);
    commit(createDocument(TEST_OTHER_ID), createHistory<string>(TEST_LIMIT));

    expect(selectedPointer.value).toBe("");
  });
});
