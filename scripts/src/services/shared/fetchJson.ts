import { fetchOk } from "#src/services/shared/fetchOk";

// A checked request's body as JSON
export const fetchJson = async <T>(url: string, headers?: Record<string, string>): Promise<T> => {
  const response = await fetchOk(url, { headers });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- response.json() is typed as any, and the caller states the type of the JSON the URL serves
  return (await response.json()) as T;
};
