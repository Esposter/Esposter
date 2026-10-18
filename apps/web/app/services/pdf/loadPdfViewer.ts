// The viewer's components and its stylesheet, loaded when a viewer mounts rather than with the app
export const loadPdfViewer = async () => {
  const [viewerModule] = await Promise.all([
    import("pdfjs-dist/web/pdf_viewer.mjs"),
    import("pdfjs-dist/web/pdf_viewer.css"),
  ]);
  return viewerModule;
};
