import { Configuration, CreateCompletionRequestPrompt, CreateCompletionRequestStop, OpenAIApi } from "openai";

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

export const generateResponse = async (prompt: CreateCompletionRequestPrompt, stop: CreateCompletionRequestStop) => {
  const result = await openai.createCompletion({
    model: "text-babbage-001",
    prompt,
    temperature: 0.9,
    max_tokens: 150,
    top_p: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.6,
    stop,
  });
  return result.data.choices?.[0].text;
};
