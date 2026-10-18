// The viewer's components and its stylesheet, loaded when a viewer mounts rather than with the app
export const loadPdfViewer = async () => {
  await import("pdfjs-dist/web/pdf_viewer.css");

  return import("pdfjs-dist/web/pdf_viewer.mjs");
};
