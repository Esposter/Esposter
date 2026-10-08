// The envelope every answer of the official map's API comes in, its data holding the answer itself
export interface InteractiveMapResponse<TData> {
  data: TData;
  message: string;
  retcode: number;
}
