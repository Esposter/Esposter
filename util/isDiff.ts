import { getDiff } from "recursive-diff";

export const isDiff = (oldValue: any, newValue: any) => getDiff(oldValue, newValue).length > 0;
