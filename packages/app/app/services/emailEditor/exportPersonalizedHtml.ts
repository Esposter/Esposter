import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { Resource } from "@esposter/db-schema";
import type { Editor } from "grapesjs";

import { downloadFile } from "@/services/app/downloadFile";
import { sanitizeFilename } from "@/services/app/sanitizeFilename";
import { getEmailHtml } from "@/services/emailEditor/getEmailHtml";
import { substituteMergeFields } from "@/services/emailEditor/substituteMergeFields";
import { strToU8, zipSync } from "fflate";

// Renders the email to HTML and zips one personalized file per dataset row; returns the count for the toast
export const exportPersonalizedHtml = (
  editor: Editor,
  resource: Resource,
  rows: Record<string, ColumnValue>[],
): number => {
  const html = getEmailHtml(editor);
  const filename = sanitizeFilename(resource.name);
  const zip = zipSync(
    Object.fromEntries(
      rows.map((row, index) => [`${filename}-${index + 1}.html`, strToU8(substituteMergeFields(html, row))]),
    ),
  );
  downloadFile(`${filename}.zip`, zip, "application/zip");
  return rows.length;
};
