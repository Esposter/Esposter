import { fetchOk } from "#src/services/shared/fetchOk";

// A checked request's body as JSON
export const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetchOk(url);
  return (await response.json()) as T;
};
