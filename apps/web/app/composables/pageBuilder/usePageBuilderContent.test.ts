import type { MjmlRootProps } from "mjml-blocks";

import { ButtonTarget } from "#shared/models/pageBuilder/ButtonTarget";
import { TEST_CONTEXT, TEST_ID, TEST_ROOT, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { createButton } from "#shared/services/pageBuilder/createButton.test";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { usePageBuilderContent } from "#src/composables/pageBuilder/usePageBuilderContent";
import { emailKind } from "#src/services/pageBuilder/emailKind";
import { webpageKind } from "#src/services/pageBuilder/webpageKind";
import { usePageBuilderCanvasStore } from "#src/store/pageBuilder/canvas";
import { usePageBuilderDocumentStore } from "#src/store/pageBuilder/document";
import { usePageBuilderHistoryStore } from "#src/store/pageBuilder/history";
import { renderMjmlDocument, serializeMjml } from "mjml-blocks";
import { createPinia, setActivePinia } from "pinia";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

// The email's settings are its root's props, which the root form writes with nothing selected, so the compile reads
// Each change
const createEmailSettings = () => {
  const resourceId = v7();
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getEmailDocument, setEmailDocument } = pageBuilderDocumentStore;
  setEmailDocument(resourceId, emailKind, { content: [], root: { props: { lang: "", title: "" } } });
  const { setFormValue } = usePageBuilderContent(emailKind, () => getEmailDocument(resourceId), resourceId);
  // The root form writes the root's whole props, so a setting is written over the props the document holds now
  const setSettings = (settings: Partial<MjmlRootProps>) => {
    const document = getEmailDocument(resourceId);
    if (!document) throw new Error("the email should be open");

    setFormValue({ ...document.root.props, ...settings });
  };
  const compile = () => {
    const document = getEmailDocument(resourceId);
    if (!document) throw new Error("the email should be open");

    return serializeMjml(renderMjmlDocument(document, emailRegistry, { context: TEST_CONTEXT, isStampingIds: false }));
  };
  return { compile, resourceId, setSettings };
};

describe(usePageBuilderContent, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("a field change is one history entry per node", () => {
    expect.hasAssertions();

    const resourceId = v7();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getDocument, setDocument } = pageBuilderDocumentStore;
    setDocument(resourceId, webpageKind, { content: [createButton(TEST_ID)], root: TEST_ROOT });
    const pageBuilderCanvasStore = usePageBuilderCanvasStore();
    const { setSelectedNodeId } = pageBuilderCanvasStore;
    setSelectedNodeId(resourceId, TEST_ID);
    const { setFormValue } = usePageBuilderContent(webpageKind, () => getDocument(resourceId), resourceId);
    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { getUndoLabel, undo } = pageBuilderHistoryStore;

    setFormValue({ elementId: "", href: TEST_URL, label: "O", target: ButtonTarget.SameTab });
    setFormValue({ elementId: "", href: TEST_URL, label: "Op", target: ButtonTarget.SameTab });

    expect(getUndoLabel(resourceId)).toBe("Edit block");
    undo(resourceId);

    expect(getUndoLabel(resourceId)).toBe("");
  });

  test("editing the title sets the title of the compiled email", () => {
    expect.hasAssertions();

    const { compile, setSettings } = createEmailSettings();

    setSettings({ title: "Hi" });

    expect(compile()).toMatchInlineSnapshot(
      `"<mjml><mj-head><mj-title>Hi</mj-title></mj-head><mj-body></mj-body></mjml>"`,
    );
  });

  test("the language setting sets the language of the email", () => {
    expect.hasAssertions();

    const { compile, setSettings } = createEmailSettings();

    setSettings({ lang: "fr" });

    expect(compile()).toMatchInlineSnapshot(`"<mjml lang="fr"><mj-body></mj-body></mjml>"`);
  });

  test("the direction setting turns the email right to left", () => {
    expect.hasAssertions();

    const { compile, setSettings } = createEmailSettings();

    setSettings({ direction: "rtl" });

    expect(compile()).toMatchInlineSnapshot(`"<mjml dir="rtl"><mj-body></mj-body></mjml>"`);
  });

  test("a font added to the list loads in the compiled email", () => {
    expect.hasAssertions();

    const { compile, setSettings } = createEmailSettings();

    setSettings({ fonts: [{ href: TEST_URL, name: "Fancy" }] });

    expect(compile()).toMatchInlineSnapshot(
      `"<mjml><mj-head><mj-font href="https://example.com/" name="Fancy"></mj-font></mj-head><mj-body></mj-body></mjml>"`,
    );
  });

  test("clearing a settings field removes it from the email", () => {
    expect.hasAssertions();

    const { compile, setSettings } = createEmailSettings();
    setSettings({ title: "Hi" });

    setSettings({ title: "" });

    expect(compile()).toMatchInlineSnapshot(`"<mjml><mj-body></mj-body></mjml>"`);
  });

  test("a settings change is one undo step", () => {
    expect.hasAssertions();

    const { resourceId, setSettings } = createEmailSettings();
    const pageBuilderDocumentStore = usePageBuilderDocumentStore();
    const { getEmailDocument } = pageBuilderDocumentStore;
    setSettings({ title: "Hi" });

    const pageBuilderHistoryStore = usePageBuilderHistoryStore();
    const { undo } = pageBuilderHistoryStore;
    undo(resourceId);

    expect(getEmailDocument(resourceId)?.root.props.title).toBe("");
  });
});
