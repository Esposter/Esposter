export const streamToText = async (readable: NodeJS.ReadableStream): Promise<string> => {
  readable.setEncoding("utf8");
  let data = "";
  for await (const chunk of readable) data += chunk.toString();
  return data;
};
