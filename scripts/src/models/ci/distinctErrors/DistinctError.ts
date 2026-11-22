// One error line a failed CI run printed, with how many times that run printed it
export interface DistinctError {
  count: number;
  error: string;
}
