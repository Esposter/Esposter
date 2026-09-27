// @vitest-environment happy-dom
import { readEmailPreviewText } from "@/services/emailEditor/readEmailPreviewText";
import { writeEmailPreviewText } from "@/services/emailEditor/writeEmailPreviewText";
import grapesJS from "grapesjs";
import grapesJSMJML from "grapesjs-mjml";
import { describe, expect, test } from "vitest";

describe(writeEmailPreviewText, () => {
  const body = "<mj-body><mj-section><mj-column><mj-text>text</mj-text></mj-column></mj-section></mj-body>";
  const text = "<b> & c";
  const createEditor = (head = "") =>
    grapesJS.init({
      headless: true,
      plugins: [grapesJSMJML],
      projectData: { pages: [{ component: `<mjml>${head}${body}</mjml>` }] },
      storageManager: false,
    });

  // The compiled HTML is what an inbox reads, so the text has to reach MJML's hidden preheader as text, not markup
  test("gives an email with no head one, compiled into the hidden preheader", () => {
    expect.hasAssertions();

    const editor = createEditor();
    writeEmailPreviewText(editor, text);
    const { html } = editor.runCommand("mjml-code-to-html") as { html: string };

    expect(readEmailPreviewText(editor)).toBe(text);
    expect(html).toContain("&lt;b&gt; &amp; c</div>");
  });

  test("replaces the preview and keeps the head's other children, and empty text removes it", () => {
    expect.hasAssertions();

    const editor = createEditor("<mj-head><mj-title>title</mj-title><mj-preview>preview</mj-preview></mj-head>");
    writeEmailPreviewText(editor, text);

    expect(editor.getHtml()).toContain(
      "<mj-head><mj-title>title</mj-title><mj-preview>&lt;b&gt; &amp; c</mj-preview></mj-head>",
    );

    writeEmailPreviewText(editor, "");

    expect(readEmailPreviewText(editor)).toBe("");
    expect(editor.getHtml()).toContain("<mj-head><mj-title>title</mj-title></mj-head>");
  });
});
