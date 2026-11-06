import type { NodeStyle } from "#shared/models/pageBuilder/NodeStyle";
import type { BlockNodeProps } from "vue-block-editor-headless";

// The props a Countdown node holds: the date it counts down to, as the editor writes it, and the text shown once it passes
export interface CountdownNodeProps extends BlockNodeProps {
  endsAt: string;
  endText: string;
  style?: NodeStyle;
}
