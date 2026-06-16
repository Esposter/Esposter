export const useReadDraftsAndSent = () => {
  const { readScheduledMessageJobs } = useReadScheduledMessageJobs();
  const { readSentMessages } = useReadSentMessages();
  return () => Promise.all([readScheduledMessageJobs(), readSentMessages()]);
};
