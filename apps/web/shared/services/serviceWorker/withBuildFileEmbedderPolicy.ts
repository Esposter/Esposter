import { BUILD_FILE_EMBEDDER_POLICY } from "#shared/services/app/constants";

// A copy of a response with the build folder's embedder policy set, whatever the stored copy's own headers say. The
// Body and the other headers are the stored copy's, so only the policy a dedicated worker's script is checked for moves
export const withBuildFileEmbedderPolicy = (response: Response): Response => {
  const headers = new Headers(response.headers);
  headers.set("Cross-Origin-Embedder-Policy", BUILD_FILE_EMBEDDER_POLICY);
  return new Response(response.body, { headers, status: response.status, statusText: response.statusText });
};
