// How many times a dead-letter queue's consumer redelivers a message its handler threw on, before Cloudflare drops it: a
// dead-letter queue has no dead-letter queue of its own. The functions Worker's dead-letter handler is the only thing that
// throws there, on a republish or a quarantine write that failed. wrangler.jsonc declares the same count for the same consumers.
const DeadLetterConsumerMaxRetries: number = 5;

export default DeadLetterConsumerMaxRetries;
