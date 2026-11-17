import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";
import type { CritiqueSources } from "#shared/models/pageBuilder/CritiqueSources";
import type { SrgbColor } from "#shared/models/shared/SrgbColor";
import type { MjmlNode, MjmlRootProps } from "mjml-blocks";

import { checkColorContrast } from "#shared/services/pageBuilder/critique/checkColorContrast";
import { getEmailTextColor } from "#shared/services/pageBuilder/email/critique/getEmailTextColor";
import { MjmlNodeType } from "mjml-blocks";

// A text is checked against the background it is drawn on, which its containers set
export const checkEmailTextContrast = (
  node: MjmlNode,
  background: SrgbColor | undefined,
  attributes: MjmlRootProps["attributes"],
  readColor: CritiqueSources["readColor"],
): CritiqueFinding[] =>
  node.type === MjmlNodeType.Text
    ? checkColorContrast(node.props.id, { background, textColor: getEmailTextColor(node, attributes, readColor) })
    : [];
