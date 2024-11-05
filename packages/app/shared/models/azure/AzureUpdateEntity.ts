import type { CompositeKey } from "@/shared/models/azure/CompositeKey";

export type AzureUpdateEntity<T> = CompositeKey & Partial<T>;
