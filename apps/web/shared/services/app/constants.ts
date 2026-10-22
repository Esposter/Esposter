// oxlint-disable-next-line naming/no-site-name-literal -- `nuxt.config` reads this copy, and importing the `@esposter/shared` barrel there drags the runtime graph into config evaluation
export const SITE_NAME = "Esposter";
export const SITE_DESCRIPTION = `${SITE_NAME} is a nice and casual place for posting random things.`;
export const LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/jimmy-chen-b6216820b";

export const LEFT_DRAWER_WIDTH = 256;
export const RIGHT_DRAWER_WIDTH = 256;
// Declared here rather than imported from @esposter/shared, which also has them: this file is pulled into
// `nuxt.config` by configuration/{site,pwa}.ts, and importing the package barrel there drags the whole runtime
// Graph (zod, neverthrow, node-html-parser) into config evaluation
export const KIBIBYTE = 2 ** 10;
export const MEGABYTE = KIBIBYTE ** 2;
export const GIBIBYTE = MEGABYTE * KIBIBYTE;
// The request body limit for a non-multipart request, which the request size limiter answers with a 413 before reading
// The body. A body that can outgrow it — a large resource's content — is committed by reference instead (openspec/specs/architecture/file-uploads/design.md)
export const MAX_REQUEST_SIZE = 2_000_000;
export const MAX_FILE_REQUEST_SIZE = 10 * MEGABYTE;

// The PWA's icons and splash screens are named by the manifest and the document head, so they stay in `public/`
export const PWA_PUBLIC_FOLDER_PATH = "/pwa";
// Between the parts of a document title, broadest first, so its last part names the page itself
export const PAGE_TITLE_SEPARATOR = " | ";
