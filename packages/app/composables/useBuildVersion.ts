const buildVersion: number | null = null;

export const useBuildVersion = () => {
  if (buildVersion !== null) return buildVersion;
  const { $client } = useNuxtApp();
  return $client.app.buildVersion.query();
};
