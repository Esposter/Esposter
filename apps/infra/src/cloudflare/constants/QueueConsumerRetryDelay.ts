// How long a failed batch waits before its queue redelivers it, in seconds. How many times it is redelivered is each
// job's `QueueJobMaxRetriesMap` entry, so the map gives the count and this one delay serves every consumer.
const QueueConsumerRetryDelay: number = 30;

export default QueueConsumerRetryDelay;
