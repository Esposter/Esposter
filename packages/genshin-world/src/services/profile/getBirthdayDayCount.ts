// The days a birthday's month holds, February's twenty-ninth included, since the save keeps no year
export const getBirthdayDayCount = (month: number): number => {
  if (month === 2) return 29;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
};
