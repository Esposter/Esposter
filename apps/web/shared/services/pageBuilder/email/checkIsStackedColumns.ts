import { EMAIL_MOBILE_BREAKPOINT } from "#shared/services/pageBuilder/email/constants";

// Whether a section's columns stack one above the other at a canvas width, as MJML stacks them in a mobile client
export const checkIsStackedColumns = (width: number) => width < EMAIL_MOBILE_BREAKPOINT;
