import type { EmailCanvasDrawing, EmailCanvasType } from "@/models/pageBuilder/EmailCanvasDrawing";

import { drawButton } from "@/services/pageBuilder/email/canvasDrawing/drawButton";
import { drawContainer } from "@/services/pageBuilder/email/canvasDrawing/drawContainer";
import { drawDivider } from "@/services/pageBuilder/email/canvasDrawing/drawDivider";
import { drawLeaf } from "@/services/pageBuilder/email/canvasDrawing/drawLeaf";
import { drawNavbarLink } from "@/services/pageBuilder/email/canvasDrawing/drawNavbarLink";
import { drawSection } from "@/services/pageBuilder/email/canvasDrawing/drawSection";
import { drawSurveyInvite } from "@/services/pageBuilder/email/canvasDrawing/drawSurveyInvite";
import { drawText } from "@/services/pageBuilder/email/canvasDrawing/drawText";
import { EmailNodeType } from "#shared/models/pageBuilder/EmailNodeType";
import { MjmlNodeType } from "mjml-blocks";

// Every email node type names its drawing here, keyed by the type, so a type with no drawing fails the typecheck. A
// Consumer's own leaf type takes the labelled box in the renderer
export const EmailCanvasDrawingMap = {
  [MjmlNodeType.Accordion]: drawContainer,
  [MjmlNodeType.AccordionElement]: drawContainer,
  [MjmlNodeType.AccordionText]: drawLeaf,
  [MjmlNodeType.AccordionTitle]: drawLeaf,
  [MjmlNodeType.Button]: drawButton,
  [MjmlNodeType.Carousel]: drawContainer,
  [MjmlNodeType.CarouselImage]: drawLeaf,
  [MjmlNodeType.Column]: drawContainer,
  [MjmlNodeType.Divider]: drawDivider,
  [MjmlNodeType.Group]: drawContainer,
  [MjmlNodeType.Hero]: drawContainer,
  [MjmlNodeType.Image]: drawLeaf,
  [MjmlNodeType.Navbar]: drawContainer,
  [MjmlNodeType.NavbarLink]: drawNavbarLink,
  [MjmlNodeType.Raw]: drawLeaf,
  [MjmlNodeType.Section]: drawSection,
  [MjmlNodeType.Social]: drawLeaf,
  [MjmlNodeType.SocialElement]: drawLeaf,
  [MjmlNodeType.Spacer]: drawLeaf,
  [MjmlNodeType.Table]: drawLeaf,
  [MjmlNodeType.Text]: drawText,
  [MjmlNodeType.Wrapper]: drawContainer,
  [EmailNodeType.SurveyInvite]: drawSurveyInvite,
} as const satisfies { [TType in EmailCanvasType]: EmailCanvasDrawing<TType> };
