export const getTypingMessageFormat = (usernames: string[]) => {
  switch (usernames.length) {
    case 1:
      return `${usernames[0]} is typing`;
    case 2:
      return `${usernames.join(" and ")} are typing`;
    default:
      return "Several people are typing";
  }
};
