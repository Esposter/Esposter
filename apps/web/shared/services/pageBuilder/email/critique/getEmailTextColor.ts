import type { CritiqueSources } from "#shared/models/pageBuilder/CritiqueSources";
import type { SrgbColor } from "#shared/models/shared/SrgbColor";
import type { MjmlRootProps, MjmlTextNode } from "mjml-blocks";

import { PAGE_TEXT_COLOR } from "#shared/services/pageBuilder/critique/constants";
import { ALL_ATTRIBUTES_KEY, MjmlNodeType } from "mjml-blocks";
import { getBlockPropValue } from "vue-block-editor-headless";

// The colour a text is drawn in: its own, read through the caller's reader, else black, the colour its component defaults to. A
// Colour a head default sets is unchecked, since the check cannot attribute that colour to this text
export const getEmailTextColor = (
  node: MjmlTextNode,
  attributes: MjmlRootProps["attributes"],
  readColor: CritiqueSources["readColor"],
): SrgbColor | undefined => {
  const value = getBlockPropValue(node.props, "color");
  if (typeof value === "string" && value) return readColor(value);

  const headDefault = attributes?.[MjmlNodeType.Text]?.color ?? attributes?.[ALL_ATTRIBUTES_KEY]?.color;
  return headDefault === undefined ? PAGE_TEXT_COLOR : undefined;
};
