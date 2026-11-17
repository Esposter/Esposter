import type { EmailDocument } from "#src/models/pageBuilder/EmailDocument";

import { MJML_DEFAULT_BODY_WIDTH } from "mjml-blocks";

// The width of the column an email is drawn in on the canvas: the width its body sets, which MJML draws a body at when it sets none
export const getEmailColumnWidth = (document: EmailDocument): string =>
  document.root.props.body?.width || MJML_DEFAULT_BODY_WIDTH;
