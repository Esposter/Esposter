import type { MjmlRootProps } from "#src/models/MjmlRootProps";
import type { BlockDocument } from "headless-block-editor";

// The core's document with the email's head and body as its root's props, the type an MJML registry's schema parses to
export type MjmlDocument = BlockDocument<MjmlRootProps>;
