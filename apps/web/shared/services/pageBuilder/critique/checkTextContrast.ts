import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";
import type { EffectiveColors } from "#shared/models/pageBuilder/EffectiveColors";
import type { WebpageNode } from "#shared/models/pageBuilder/WebpageNode";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { checkColorContrast } from "#shared/services/pageBuilder/critique/checkColorContrast";

export const checkTextContrast = (node: WebpageNode, colors: EffectiveColors): CritiqueFinding[] =>
  node.type === WebpageNodeType.Text ? checkColorContrast(node.props.id, colors) : [];
