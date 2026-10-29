// A push the remote turned down because another session moved the queue, or a ref git could not lock while another
// Push was writing it. Anything else, such as a network failure or a denied credential, will not change on a retry
const RETRYABLE_PUSH_REGEX = /rejected|fetch first|non-fast-forward|cannot lock ref/u;

export const checkIsRetryablePush = (stderr: string): boolean => RETRYABLE_PUSH_REGEX.test(stderr);
