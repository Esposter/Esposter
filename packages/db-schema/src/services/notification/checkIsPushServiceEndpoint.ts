import { PUSH_SERVICE_HOSTS } from "#src/services/notification/constants";

// Whether an endpoint is an https url on one of the browsers' push services. The subscribe input refuses an endpoint
// That fails it, and the jobs worker checks each stored endpoint against it before a request is sent to that endpoint
export const checkIsPushServiceEndpoint = (endpoint: string): boolean => {
  if (!URL.canParse(endpoint)) return false;
  const { hostname, protocol } = new URL(endpoint);
  return (
    protocol === "https:" &&
    PUSH_SERVICE_HOSTS.some((host) => (host.startsWith(".") ? hostname.endsWith(host) : hostname === host))
  );
};
