import { downloadFile } from "@/services/app/downloadFile";
import { strToU8, zipSync } from "fflate";

// The zip core both personalized exports share: each entry is one file's name and its finished html, so the email
// Export and the program's invites are one writer. Returns the count for the toast
export const exportPersonalizedHtml = (zipName: string, htmlFiles: Record<string, string>) => {
  const zip = zipSync(
    Object.fromEntries(Object.entries(htmlFiles).map(([name, html]) => [`${name}.html`, strToU8(html)])),
  );
  downloadFile(`${zipName}.zip`, zip, "application/zip");
  return Object.keys(htmlFiles).length;
};
