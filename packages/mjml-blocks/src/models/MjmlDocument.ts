import type { MjmlNode } from "#src/models/MjmlNode";
import type { MjmlRootProps } from "#src/models/MjmlRootProps";
import type { BlockDocument } from "headless-block-editor";

// The core's document of an MJML email: its nodes of the built-in types and of the leaf types a consumer declared, with the head and body as its root's props
export type MjmlDocument = BlockDocument<MjmlNode, MjmlRootProps>;
