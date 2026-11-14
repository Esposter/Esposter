// How a queue's consumer retries a batch whose handler threw. An idempotent job reruns without duplicating its work,
// So it retries after a delay that lets a transient failure clear. A non-idempotent one never retries: a rerun would
// Do the work twice, so its failure goes to the job's dead-letter queue for a person to read.
const QueueConsumerRetry: {
  idempotent: { maxRetries: number; retryDelay: number };
  nonIdempotent: { maxRetries: number; retryDelay: number };
} = { idempotent: { maxRetries: 5, retryDelay: 30 }, nonIdempotent: { maxRetries: 0, retryDelay: 0 } };

export default QueueConsumerRetry;
