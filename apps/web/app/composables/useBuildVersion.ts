// Module-level rather than a store, which is the opposite of what `store/cache.ts` argues for its registry: the
// Value identifies the running build, so sharing it across a server process's requests is the point rather than
// A leak, and it can never be invalidated within one
let buildVersion: number | undefined;

export const useBuildVersion = async () => {
  if (buildVersion !== undefined) return buildVersion;
  const { $trpc } = useNuxtApp();
  buildVersion = await $trpc.app.readBuildVersion.query();
  return buildVersion;
};
