import { AzureContainer } from "@/models/azure/blob";
import { append, getContainerClient } from "@/services/azure/blob";
import { generateResponse } from "@/services/openai";
import { sanitiseText, streamToText } from "@/utils/text";
import dedent from "dedent";

const chatHistoryFileName = "ChatHistory.txt";
const containerClient = await getContainerClient(AzureContainer.AIChatbot);

export const getChatHistory = async (userId: string, AIName: string) => {
  const blobName = `${userId}/${AIName}/${chatHistoryFileName}`;
  const blobClient = containerClient.getAppendBlobClient(blobName);
  if (!(await blobClient.exists())) return "";

  const response = await blobClient.download();
  if (!response.readableStreamBody) return "";
  return streamToText(response.readableStreamBody);
};

export const appendChatHistory = async (userId: string, AIName: string, chatContent: string) => {
  const blobName = `${userId}/${AIName}/${chatHistoryFileName}`;
  const blobClient = containerClient.getAppendBlobClient(blobName);
  await append(blobClient, chatContent);
};

const AIName = "Vivy";
const AIGender = "female";
const AILanguage = "English";
const humanPrompter = "Human:";
const AIPrompter = "AI:";
const errorMessage = "Sorry! I didn't quite get what you were trying to say. Can you please try again?";

export const generateAIResponse = async (userId: string, prompt: string, welcomeMessage: string) => {
  const chatHistory = await getChatHistory(userId, AIName);
  const initalAIPrompt = `${AIPrompter} ${welcomeMessage}`;
  const humanPrompt = `${humanPrompter} ${sanitiseText(prompt)}`;
  const AIPrompt = dedent`The following is a conversation with ${AIName}, a ${AIGender} AI assistant that speaks ${AILanguage}. The assistant is helpful, creative, clever, and very friendly.
  
  ${initalAIPrompt}
  ${chatHistory}${humanPrompt}
  ${AIPrompter} `;
  const response = await generateResponse(AIPrompt, [
    ` ${humanPrompter}`,
    `\n${humanPrompter}`,
    ` ${AIPrompter}`,
    `\n${AIPrompter}`,
  ]);
  if (!response) return errorMessage;

  const AIPromptResponse = `${AIPrompter} ${response}`;
  await appendChatHistory(userId, AIName, `${humanPrompt}\n${AIPromptResponse}\n`);
  return response.trim();
};
