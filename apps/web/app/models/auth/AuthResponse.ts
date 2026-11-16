export interface AuthResponse<TData> {
  data: null | TData;
  error: null | { message?: string | undefined; statusText: string };
}
