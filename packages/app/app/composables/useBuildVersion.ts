let buildVersion: number | undefined;

export const useBuildVersion = async () => {
  if (buildVersion !== undefined) return buildVersion;
  const { $trpc } = useNuxtApp();
  buildVersion = await $trpc.app.buildVersion.query();
  return buildVersion;
};
