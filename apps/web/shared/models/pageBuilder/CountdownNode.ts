import type { CountdownNodeProps } from "#shared/models/pageBuilder/CountdownNodeProps";
import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import type { BlockNode } from "vue-block-editor-headless";

// A Countdown node of a webpage: a timer to a date
export type CountdownNode = BlockNode<WebpageNodeType.Countdown, CountdownNodeProps>;
