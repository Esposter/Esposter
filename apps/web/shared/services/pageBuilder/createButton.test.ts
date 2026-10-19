import type { ButtonNode } from "#shared/models/pageBuilder/ButtonNode";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_LABEL, TEST_URL } from "#shared/services/pageBuilder/constants.test";
import { describe } from "vitest";

export const createButton = (id: string): ButtonNode => ({
  props: { href: TEST_URL, id, label: TEST_LABEL },
  type: WebpageNodeType.Button,
});

describe.todo("createButton");
