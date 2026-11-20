import { authClient } from "#src/services/auth/authClient";

// The signed-in user's id on the client, "" until the session resolves
export const useSessionUserId = () => {
  const session = authClient.useSession();
  return computed(() => session.value.data?.user.id ?? "");
};
