let buildVersion: number | undefined;

export const useBuildVersion = async () => {
  if (buildVersion !== undefined) return buildVersion;
  const { $client } = useNuxtApp();
  buildVersion = await $client.app.buildVersion.query();
  return buildVersion;
};
