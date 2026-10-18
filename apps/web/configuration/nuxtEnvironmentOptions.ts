/**
 * The nuxt environment both Vitest configs run under: rooted at this package rather than the vitest cwd (the repo root,
 * where `@nuxt/kit` and the App don't resolve), and on a `.test` origin, which never resolves, rather than Nuxt's default
 * of `localhost:3000`. msw intercepts beneath happy-dom's `fetch`, and a request it misses there went out to whatever
 * listened on the default port, so a running dev server answered with the real router and a suite failed only while one
 * was up. On this origin a missed request fails at once.
 */
export const getNuxtEnvironmentOptions = (rootDirectory: string) => ({
  nuxt: { rootDir: rootDirectory, url: "http://nuxt.test" },
});
