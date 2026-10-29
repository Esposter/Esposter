import type { EmailDocument } from "#shared/models/pageBuilder/email/EmailDocument";
import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";

import { ElementAttribute } from "#shared/models/pageBuilder/html/ElementAttribute";
import { ElementTag } from "#shared/models/pageBuilder/html/ElementTag";
import { createMjmlElement } from "#shared/services/pageBuilder/email/createMjmlElement";
import { EmailNodeTypeMap } from "#shared/services/pageBuilder/email/EmailNodeTypeMap";
import { createText } from "#shared/services/pageBuilder/html/createText";
import { serializeHtmlNode } from "#shared/services/pageBuilder/html/serializeHtmlNode";
import { renderPageNode } from "#shared/services/pageBuilder/renderPageNode";

// The root's lang on mjml, the preview text in the head, and the nodes in the body
export const renderEmailMjml = ({ content, root }: EmailDocument, context: RenderContext) =>
  serializeHtmlNode(
    createMjmlElement(ElementTag.Mjml, { [ElementAttribute.Lang]: root.props.lang }, [
      ...(root.props.previewText
        ? [
            createMjmlElement(ElementTag.MjmlHead, {}, [
              createMjmlElement(ElementTag.MjmlPreview, {}, [createText(root.props.previewText)]),
            ]),
          ]
        : []),
      createMjmlElement(
        ElementTag.MjmlBody,
        { [ElementAttribute.BackgroundColor]: root.props.backgroundColor, [ElementAttribute.Width]: root.props.width },
        content.map((node) => renderPageNode(EmailNodeTypeMap, node, context)),
      ),
    ]),
  );
