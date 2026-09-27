import type { Component, Editor } from "grapesjs";

// The email's mj-preview, which the MJML plugin registers no type for, so it is found by its tag inside the head
export const getEmailPreview = (editor: Editor): Component | undefined => {
  const [head] = editor.getWrapper()?.findType("mj-head") ?? [];
  return head?.components().find((component: Component) => component.get("tagName") === "mj-preview");
};
