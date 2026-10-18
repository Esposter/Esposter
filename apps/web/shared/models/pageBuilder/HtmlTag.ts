import type { SectionTag } from "#shared/models/pageBuilder/SectionTag";

// The tags a node type's render writes, and nothing else
export type HtmlTag = "a" | "button" | "img" | "span" | "video" | `${SectionTag}`;
