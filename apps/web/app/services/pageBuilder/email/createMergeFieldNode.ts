import type { MjmlNode } from "mjml-blocks";

import { toMergeField } from "@/services/emailEditor/toMergeField";
import { MjmlNodeType } from "mjml-blocks";

// A merge field is a text node whose one paragraph is its column's token, which the reader sees until the email is filled
export const createMergeFieldNode = (columnName: string, id: string): MjmlNode => ({
  props: {
    content: {
      content: [{ content: [{ text: toMergeField(columnName), type: "text" }], type: "paragraph" }],
      type: "doc",
    },
    id,
  },
  type: MjmlNodeType.Text,
});
