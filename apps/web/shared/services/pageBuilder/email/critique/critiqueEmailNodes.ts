import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";
import type { CritiqueSources } from "#shared/models/pageBuilder/CritiqueSources";
import type { SrgbColor } from "#shared/models/shared/SrgbColor";
import type { MjmlNode, MjmlRootProps } from "mjml-blocks";

import { checkEmailLink } from "#shared/services/pageBuilder/email/critique/checkEmailLink";
import { checkEmailTextContrast } from "#shared/services/pageBuilder/email/critique/checkEmailTextContrast";
import { getEmailBackground } from "#shared/services/pageBuilder/email/critique/getEmailBackground";
import { emailNodeChildren } from "#shared/services/pageBuilder/email/emailNodeChildren";
import { getBlockSlots } from "vue-block-editor-headless";

// Each node's own findings before those of its children, so the list reads in document order. The background passed down is the
// One the node's containers set, which a child inherits unless it sets its own
export const critiqueEmailNodes = (
  nodes: readonly MjmlNode[],
  inherited: SrgbColor | undefined,
  attributes: MjmlRootProps["attributes"],
  readColor: CritiqueSources["readColor"],
): CritiqueFinding[] =>
  nodes.flatMap((node) => {
    const background = getEmailBackground(node, inherited, readColor);

    return [
      ...checkEmailLink(node),
      ...checkEmailTextContrast(node, background, attributes, readColor),
      ...Object.values(getBlockSlots(emailNodeChildren, node)).flatMap((slotNodes) =>
        critiqueEmailNodes(slotNodes, background, attributes, readColor),
      ),
    ];
  });
