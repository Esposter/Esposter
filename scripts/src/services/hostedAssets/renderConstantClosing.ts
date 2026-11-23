// The line that closes each constant `renderConstant` writes, after its body. It lives apart from constants.ts, which imports
// `@esposter/db-schema`, because the renderer runs from `nuxt prepare` before any workspace package is built
export const RENDERED_CONSTANT_CLOSING = "} as const;";
