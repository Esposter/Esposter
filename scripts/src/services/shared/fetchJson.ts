import { fetchOk } from "#src/services/shared/fetchOk";

// A checked request's body as JSON
export const fetchJson = async <T>(url: string, headers?: Record<string, string>): Promise<T> => {
  const response = await fetchOk(url, { headers });
  return (await response.json()) as T;
};
