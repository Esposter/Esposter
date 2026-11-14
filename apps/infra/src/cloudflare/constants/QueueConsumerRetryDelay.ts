// How long a failed batch waits before its queue redelivers it, in seconds.
// Each job's `QueueJobMaxRetriesMap` entry gives how many times it is redelivered, so the map gives the count.
// This one delay serves every consumer.
const QueueConsumerRetryDelay = 30;

export default QueueConsumerRetryDelay;
