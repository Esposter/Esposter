import { HOST_PARAMETER_NAMES, LOCAL_HOSTNAMES } from "#src/services/devSeed/constants";

// Whether a URL names a server on this machine: a loopback hostname, and neither a query parameter nor a fragment that
// Moves the host off it
export const checkIsLocalUrl = (url: string): boolean => {
  if (!URL.canParse(url)) return false;
  const parsedUrl = new URL(url);
  return (
    LOCAL_HOSTNAMES.includes(parsedUrl.hostname) &&
    parsedUrl.hash === "" &&
    !HOST_PARAMETER_NAMES.some((name) => parsedUrl.searchParams.has(name))
  );
};
