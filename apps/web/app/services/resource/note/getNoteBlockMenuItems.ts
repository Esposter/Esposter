// @unocss-include
import type { MenuItem } from "@/models/shared/MenuItem";
import type { Editor } from "@tiptap/vue-3";

// The block-level items the Note's menu bar and its slash menu both offer, in the order both draw them. The list items
// Are the shared ones, and the text marks are the composer's, so only the Note's own blocks are listed here
export const getNoteBlockMenuItems = (editor: Editor | undefined): MenuItem[] => [
  {
    active: editor?.isActive("paragraph"),
    icon: "i-mdi:format-paragraph",
    onClick: () => {
      editor?.chain().focus().setParagraph().run();
    },
    title: "Paragraph",
  },
  {
    active: editor?.isActive("heading", { level: 1 }),
    icon: "i-mdi:format-header-1",
    onClick: () => {
      editor?.chain().focus().toggleHeading({ level: 1 }).run();
    },
    title: "Heading 1",
  },
  {
    active: editor?.isActive("heading", { level: 2 }),
    icon: "i-mdi:format-header-2",
    onClick: () => {
      editor?.chain().focus().toggleHeading({ level: 2 }).run();
    },
    title: "Heading 2",
  },
  {
    active: editor?.isActive("heading", { level: 3 }),
    icon: "i-mdi:format-header-3",
    onClick: () => {
      editor?.chain().focus().toggleHeading({ level: 3 }).run();
    },
    title: "Heading 3",
  },
  {
    active: editor?.isActive("taskList"),
    icon: "i-mdi:format-list-checks",
    onClick: () => {
      editor?.chain().focus().toggleTaskList().run();
    },
    title: "Task List",
  },
  {
    active: editor?.isActive("blockquote"),
    icon: "i-mdi:format-quote-close",
    onClick: () => {
      editor?.chain().focus().toggleBlockquote().run();
    },
    title: "Blockquote",
  },
];
