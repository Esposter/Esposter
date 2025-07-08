export const ranking = (likes: number, createdAt: Date) => {
  const absLikes = Math.abs(likes);
  const n = Math.max(absLikes, 1);
  return Math.sign(likes) * Math.log10(n) + Math.max(0, createdAt.getTime() - 1500000000000) / 45000000;
};
