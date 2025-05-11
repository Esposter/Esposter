import dedent from "dedent";

export const commitBlockList = async (sasUrl: string, blockIds: string[]) =>
  await fetch(`${sasUrl}&comp=blocklist`, {
    body: dedent`
    <BlockList>
      ${blockIds.map((blockId) => `<Latest>${blockId}</Latest>`).join("\n")}
    </BlockList>
  `,
    headers: {
      "Content-Type": "application/xml",
      "x-ms-blob-content-type": "application/xml",
    },
    method: "PUT",
  });
