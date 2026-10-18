// The renderer's own data, served from its install by Nitro's public assets under these base URLs
export const PDF_CMAP_BASE_URL = "/pdfjs/character-maps/";
export const PDF_STANDARD_FONT_DATA_BASE_URL = "/pdfjs/standard_fonts/";
export const PDF_WASM_BASE_URL = "/pdfjs/wasm/";
// The largest canvas iOS Safari draws, in pixels: a page drawn above it comes out blank
export const PDF_MAX_CANVAS_AREA = 16_777_216;
export const PDF_MAX_SCALE = 10;
export const PDF_ROTATION_STEP = 90;
export const PDF_FULL_TURN = 360;
export const PDF_PRINT_SCALE = 2;
export const PDF_PRINT_BATCH_SIZE = 10;
export const PDF_PRINT_CLASS = "pdf-print";
// Each sheet holds one page at its own margin, and nothing else of the app prints beside it
export const PDF_PRINT_STYLE = `@page { margin: 3mm } .${PDF_PRINT_CLASS} img { display: block; page-break-after: always; width: 100% } @media print { body > :not(.${PDF_PRINT_CLASS}) { display: none !important } }`;
