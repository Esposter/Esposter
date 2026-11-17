import type { CritiqueSources } from "#shared/models/pageBuilder/CritiqueSources";
import type { SrgbColor } from "#shared/models/shared/SrgbColor";
import type { MjmlNode } from "mjml-blocks";

import { getBlockPropValue } from "vue-block-editor-headless";

// The background a block is drawn on: the background attribute it sets, read through the caller's reader, or else the one it
// Inherits. A set attribute the reader cannot read is no background at all, so a text on it is unchecked rather than checked
export const getEmailBackground = (
  node: MjmlNode,
  inherited: SrgbColor | undefined,
  readColor: CritiqueSources["readColor"],
): SrgbColor | undefined => {
  const value = getBlockPropValue(node.props, "background-color");
  return typeof value === "string" && value ? readColor(value) : inherited;
};
