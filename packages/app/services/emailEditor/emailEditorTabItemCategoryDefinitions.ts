import type { EmailEditorTabItemCategoryDefinition } from "@/models/emailEditor/EmailEditorTabItemCategoryDefinition";
import type { Except } from "type-fest";

import { EmailEditorTabType } from "@/models/emailEditor/EmailEditorTabType";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";

const EmailEditorTabItemCategoryDefinitionMap = {
  [EmailEditorTabType.JSON]: {
    icon: "mdi-code-braces",
  },
  [EmailEditorTabType.MJML]: {
    icon: "mdi-code-tags",
  },
  [EmailEditorTabType.Preview]: {
    icon: "mdi-email-search",
  },
} as const satisfies Record<EmailEditorTabType, Except<EmailEditorTabItemCategoryDefinition, "type" | "value">>;

export const emailEditorTabItemCategoryDefinitions: EmailEditorTabItemCategoryDefinition[] = parseDictionaryToArray(
  EmailEditorTabItemCategoryDefinitionMap,
  "type",
).map((t, index) => ({ ...t, value: index }));
