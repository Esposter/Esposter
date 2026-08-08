interface AuthResponse<TData> {
  data: null | TData;
  error: null | { message?: string; statusText: string };
}
// The auth client answers with a payload rather than a rejection, and its `fetchOptions: { throw: true }` escape
// Hatch throws an error whose message is only the http status text — the api's own message (a session too old to
// Unlink with, the last-account guard) rides on a property nothing downstream reads, so a rejected link surfaced
// As "Bad Request". Raising the rejection from the payload keeps the text that tells the user what to do
export const requireAuthData = async <TData>(authResponse: Promise<AuthResponse<TData>>): Promise<null | TData> => {
  const { data, error } = await authResponse;
  if (error) throw new Error(error.message ?? error.statusText);
  return data;
};
