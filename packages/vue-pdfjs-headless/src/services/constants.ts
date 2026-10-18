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
// Each sheet holds one page at its own margin, and nothing else of the page prints beside it.
// The template literal holds a substitution the declaration emitter cannot type, so its annotation stays
// oxlint-disable-next-line typescript/no-inferrable-types -- The declaration emitter needs the annotation the linter calls redundant
export const PDF_PRINT_STYLE: string = `@page { margin: 3mm } .${PDF_PRINT_CLASS} img { display: block; page-break-after: always; width: 100% } @media print { body > :not(.${PDF_PRINT_CLASS}) { display: none !important } }`;
// The wheel's Ctrl zoom grows the scale by e to the power of the wheel's distance over this divisor
export const PDF_WHEEL_ZOOM_DIVISOR = 500;
