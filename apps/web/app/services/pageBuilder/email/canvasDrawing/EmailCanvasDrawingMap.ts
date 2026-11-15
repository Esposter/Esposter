import type { EmailCanvasDrawing, EmailCanvasType } from "#src/models/pageBuilder/EmailCanvasDrawing";

import { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import { drawContainer } from "#src/services/pageBuilder/email/canvasDrawing/drawContainer";
import { drawDivider } from "#src/services/pageBuilder/email/canvasDrawing/drawDivider";
import { drawHero } from "#src/services/pageBuilder/email/canvasDrawing/drawHero";
import { drawLabel } from "#src/services/pageBuilder/email/canvasDrawing/drawLabel";
import { drawLeaf } from "#src/services/pageBuilder/email/canvasDrawing/drawLeaf";
import { drawNavbarLink } from "#src/services/pageBuilder/email/canvasDrawing/drawNavbarLink";
import { drawRaw } from "#src/services/pageBuilder/email/canvasDrawing/drawRaw";
import { drawSection } from "#src/services/pageBuilder/email/canvasDrawing/drawSection";
import { drawSpacer } from "#src/services/pageBuilder/email/canvasDrawing/drawSpacer";
import { drawSurveyInvite } from "#src/services/pageBuilder/email/canvasDrawing/drawSurveyInvite";
import { drawTable } from "#src/services/pageBuilder/email/canvasDrawing/drawTable";
import { drawText } from "#src/services/pageBuilder/email/canvasDrawing/drawText";
import { MjmlNodeType } from "mjml-blocks";

// Every email node type names its drawing here, keyed by the type, so a type with no drawing fails the typecheck.
// The renderer has no fallback for it
export const EmailCanvasDrawingMap = {
  [EmailNodeType.SurveyInvite]: drawSurveyInvite,
  [MjmlNodeType.Accordion]: drawContainer,
  [MjmlNodeType.AccordionElement]: drawContainer,
  [MjmlNodeType.AccordionText]: drawText,
  [MjmlNodeType.AccordionTitle]: drawLabel,
  [MjmlNodeType.Button]: drawLabel,
  [MjmlNodeType.Carousel]: drawContainer,
  [MjmlNodeType.CarouselImage]: drawLeaf,
  [MjmlNodeType.Column]: drawContainer,
  [MjmlNodeType.Divider]: drawDivider,
  [MjmlNodeType.Group]: drawContainer,
  [MjmlNodeType.Hero]: drawHero,
  [MjmlNodeType.Image]: drawLeaf,
  [MjmlNodeType.Navbar]: drawContainer,
  [MjmlNodeType.NavbarLink]: drawNavbarLink,
  [MjmlNodeType.Raw]: drawRaw,
  [MjmlNodeType.Section]: drawSection,
  [MjmlNodeType.Social]: drawLeaf,
  [MjmlNodeType.SocialElement]: drawLeaf,
  [MjmlNodeType.Spacer]: drawSpacer,
  [MjmlNodeType.Table]: drawTable,
  [MjmlNodeType.Text]: drawText,
  [MjmlNodeType.Wrapper]: drawContainer,
} as const satisfies { [TType in EmailCanvasType]: EmailCanvasDrawing<TType> };
