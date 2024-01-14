export const generateCode = (length: number) => {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * characters.length);
    code += characters.charAt(index);
  }

  return code;
};
