import type { ImageNode } from "#shared/models/pageBuilder/ImageNode";
import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";
import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { describe } from "vitest";

export const TEST_ID = "a";
export const TEST_OTHER_ID = "b";
export const TEST_LABEL = "Go";
export const TEST_LANG = "en";
export const TEST_ORIGIN = "https://esposter.test";
export const TEST_URL = "https://example.com/";
export const TEST_SURVEY_ID = crypto.randomUUID();
export const TEST_CONTEXT: RenderContext = { origin: TEST_ORIGIN };
export const TEST_ROOT: WebpageDocument["root"] = { props: { lang: TEST_LANG, tokens: {} } };
// An image node that loads from the address given, the way a page that names a file asset holds it
export const createTestImageNode = (src: string): ImageNode => ({
  props: { alt: "", decorative: true, id: crypto.randomUUID(), src },
  type: WebpageNodeType.Image,
});

describe.todo("constants");
