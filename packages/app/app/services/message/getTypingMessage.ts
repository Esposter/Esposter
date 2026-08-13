import { takeOne } from "@esposter/shared";

export const getTypingMessage = (usernames: string[]) => {
  switch (usernames.length) {
    case 0:
      return "";
    case 1:
      return `${takeOne(usernames)} is typing...`;
    case 2:
      return `${usernames.join(" and ")} are typing...`;
    default:
      return "Several people are typing...";
  }
};
