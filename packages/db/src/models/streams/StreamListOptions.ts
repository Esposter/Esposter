// How a list is ordered and cut. `orderBy` sorts by rowKey: a reverse-ticked rowKey is newest-first in "asc", so
// "desc" reads oldest-first.
export interface StreamListOptions {
  limit?: number;
  orderBy?: "asc" | "desc";
}
