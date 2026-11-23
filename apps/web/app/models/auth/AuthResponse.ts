export interface AuthResponse<TData> {
  data: null | TData;
  error: { message?: string | undefined; statusText: string } | null;
}
