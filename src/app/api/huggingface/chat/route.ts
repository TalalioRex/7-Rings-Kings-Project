import { NextResponse } from "next/server";
import {
  createHuggingFaceChatCompletion,
  type HuggingFaceChatMessage
} from "@/lib/huggingface";

type ChatRouteBody = {
  messages?: HuggingFaceChatMessage[];
  prompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

function isChatMessage(value: unknown): value is HuggingFaceChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<HuggingFaceChatMessage>;
  return (
    (candidate.role === "system" || candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string" &&
    candidate.content.trim().length > 0
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRouteBody;
    const messages =
      body.messages?.filter(isChatMessage) ??
      (body.prompt?.trim() ? [{ role: "user" as const, content: body.prompt.trim() }] : []);

    if (messages.length === 0) {
      return NextResponse.json(
        { error: "Send either a non-empty prompt or a messages array." },
        { status: 400 }
      );
    }

    const completion = await createHuggingFaceChatCompletion({
      messages,
      model: body.model,
      temperature: body.temperature,
      maxTokens: body.maxTokens
    });

    return NextResponse.json(completion);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Hugging Face chat failed.";
    const status = message.includes("HF_TOKEN") ? 500 : 502;

    return NextResponse.json({ error: message }, { status });
  }
}
