import type { EmailDocument } from "#src/models/pageBuilder/EmailDocument";

import { TEST_ID, TEST_LABEL, TEST_OTHER_ID, TEST_THIRD_ID } from "#shared/services/pageBuilder/constants.test";
import { MjmlNodeType } from "mjml-blocks";
import { describe } from "vitest";

// A section holding one column, which holds a button whose address is written when given
export const createEmailButtonSection = (href: string | undefined): EmailDocument["content"][number] => ({
  props: {
    children: [
      {
        props: {
          children: [
            {
              props: { content: TEST_LABEL, id: TEST_ID, ...(href === undefined ? {} : { href }) },
              type: MjmlNodeType.Button,
            },
          ],
          id: TEST_OTHER_ID,
        },
        type: MjmlNodeType.Column,
      },
    ],
    id: TEST_THIRD_ID,
  },
  type: MjmlNodeType.Section,
});

describe.todo("createEmailButtonSection");
