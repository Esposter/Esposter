import { DocumentType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

export const DocumentTypeRoutePathMap = {
  [DocumentType.Dashboard]: RoutePath.DashboardEditor,
  [DocumentType.Email]: RoutePath.EmailEditor,
  [DocumentType.Flowchart]: RoutePath.FlowchartEditor,
  [DocumentType.Table]: RoutePath.TableEditor,
  [DocumentType.Webpage]: RoutePath.WebpageEditor,
} as const satisfies Record<DocumentType, string>;
