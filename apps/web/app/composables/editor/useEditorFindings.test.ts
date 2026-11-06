import { EditorFindingSeverity } from "@/models/editor/EditorFindingSeverity";
import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "@/services/resource/constants";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(useEditorFindings, () => {
  const message = crypto.randomUUID();
  const nodeId = crypto.randomUUID();
  const clash = { message, nodeId, severity: EditorFindingSeverity.Error };
  // Two equal names are one clash, which the check lists against the second question
  const checkClash = ({ firstName, secondName }: { firstName: string; secondName: string }) =>
    firstName === secondName ? [clash] : [];

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("A fix removes its finding", async () => {
    expect.hasAssertions();

    const editorDocument = ref({ firstName: "", secondName: "" });
    const findings = useEditorFindings(editorDocument, checkClash);

    expect(findings.value).toStrictEqual([clash]);

    editorDocument.value = { ...editorDocument.value, secondName: " " };
    await nextTick();

    expect(findings.value).toStrictEqual([clash]);

    vi.advanceTimersByTime(RESOURCE_AUTOSAVE_DEBOUNCE_MS);

    expect(findings.value).toStrictEqual([]);
  });
});
