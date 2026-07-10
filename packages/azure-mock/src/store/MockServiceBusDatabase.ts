import type { ServiceBusMessage } from "@azure/service-bus";
// Map<queue, Array<message>>
export const MockServiceBusDatabase: Map<string, ServiceBusMessage[]> = new Map<string, ServiceBusMessage[]>();
