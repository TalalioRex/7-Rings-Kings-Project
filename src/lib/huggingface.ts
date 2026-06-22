export type HuggingFaceChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type HuggingFaceChatRequest = {
  messages: HuggingFaceChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

export type HuggingFaceChatResponse = {
  id?: string;
  model?: string;
  message: HuggingFaceChatMessage;
};

type HuggingFaceRouterChoice = {
  message?: {
    role?: string;
    content?: string;
  };
};

type HuggingFaceRouterResponse = {
  id?: string;
  model?: string;
  choices?: HuggingFaceRouterChoice[];
  error?: {
    message?: string;
  };
};

const HUGGING_FACE_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";
const DEFAULT_CHAT_MODEL = "openai/gpt-oss-120b:fastest";

export async function createHuggingFaceChatCompletion({
  messages,
  model = process.env.HF_CHAT_MODEL ?? DEFAULT_CHAT_MODEL,
  temperature = 0.7,
  maxTokens = 500
}: HuggingFaceChatRequest): Promise<HuggingFaceChatResponse> {
  const token = process.env.HF_TOKEN;

  if (!token) {
    throw new Error("Missing HF_TOKEN. Add it to .env.local before calling Hugging Face.");
  }

  if (messages.length === 0) {
    throw new Error("At least one chat message is required.");
  }

  const response = await fetch(HUGGING_FACE_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      temperature,
      max_tokens: maxTokens
    })
  });

  const data = (await response.json().catch(() => ({}))) as HuggingFaceRouterResponse;

  if (!response.ok) {
    throw new Error(data.error?.message ?? `Hugging Face request failed with ${response.status}.`);
  }

  const message = data.choices?.[0]?.message;

  if (!message?.content) {
    throw new Error("Hugging Face returned no assistant message.");
  }

  return {
    id: data.id,
    model: data.model ?? model,
    message: {
      role: "assistant",
      content: message.content
    }
  };
}
