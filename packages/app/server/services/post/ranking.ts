export const ranking = (likes: number, createdAt: Date) => {
  const absLikes = Math.abs(likes);
  const n = Math.max(absLikes, 1);
  return Math.sign(likes) * Math.log10(n) + Math.max(0, createdAt.getTime() - 1_500_000_000_000) / 45_000_000;
};
