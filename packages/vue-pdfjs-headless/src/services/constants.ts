// The largest canvas iOS Safari draws, in pixels: a page drawn above it comes out blank
export const PDF_MAX_CANVAS_AREA = 16_777_216;
export const PDF_MIN_SCALE = 0.1;
export const PDF_MAX_SCALE = 10;
export const PDF_ROTATION_STEP = 90;
export const PDF_FULL_TURN = 360;
export const PDF_PRINT_SCALE = 2;
export const PDF_PRINT_BATCH_SIZE = 10;
export const PDF_PRINT_CLASS = "pdf-print";
export const PDF_MIME_TYPE = "application/pdf";
// The key prefix pdf.js files its annotation editors under in the annotation storage, which its save reads from there
export const PDF_EDITOR_KEY_PREFIX = "pdfjs_internal_editor_";
// A free text imported from XFDF is written in this size and this RGB colour, as XFDF carries neither
export const PDF_FREE_TEXT_FONT_SIZE = 12;
export const PDF_FREE_TEXT_COLOR: number[] = [0, 0, 0];
// A watermark is written in this size, centred on each page, and in this RGB colour
export const PDF_WATERMARK_FONT_SIZE = 48;
export const PDF_WATERMARK_COLOR: number[] = [128, 128, 128];
// Each sheet holds one page at its own margin, and nothing else of the page prints beside it.
// The template literal holds a substitution the declaration emitter cannot type, so its annotation stays
// oxlint-disable-next-line typescript/no-inferrable-types -- The declaration emitter needs the annotation the linter calls redundant
export const PDF_PRINT_STYLE: string = `@page { margin: 3mm } .${PDF_PRINT_CLASS} { display: none } .${PDF_PRINT_CLASS} img { display: block; page-break-after: always; width: 100% } @media print { .${PDF_PRINT_CLASS} { display: block } body > :not(.${PDF_PRINT_CLASS}) { display: none !important } }`;
// The wheel's Ctrl zoom grows the scale by e to the power of the wheel's distance over this divisor
export const PDF_WHEEL_ZOOM_DIVISOR = 500;
