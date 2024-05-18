export const getInitials = (fullName: string) => {
  const allNames = fullName.trim().split(" ");
  const initials = allNames.reduce((acc, curr, index) => {
    if (index === 0 || index === allNames.length - 1) return `${acc}${curr.charAt(0).toUpperCase()}`;
    return acc;
  }, "");
  return initials;
};
