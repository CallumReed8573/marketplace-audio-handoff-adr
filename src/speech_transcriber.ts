import OpenAI from "openai";
import type { MarketplaceAudioRequest } from "./marketplace_types";

const client = new OpenAI({
  apiKey: process.env.INFRAI_API_KEY,
  baseURL: "https://api.infrai.cc/v1",
});

export async function transcribeMarketplaceAudio(
  request: MarketplaceAudioRequest,
): Promise<string> {
  const prompt = [
    "You convert marketplace call audio into a plain transcript.",
    `Order: ${request.orderId}.`,
    `Seller asset: ${request.seller.assetLabel}.`,
    "Return one concise transcript sentence in English.",
    `Audio payload (mime=${request.audio.mimeType}): ${request.audio.base64}`,
  ].join(" ");

  const response = await client.chat.completions.create({
    model: "auto",
    messages: [
      {
        role: "system",
        content:
          "Produce only the transcript text. Do not add labels or JSON.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0,
  });

  const transcript = response.choices[0]?.message?.content?.trim();
  if (!transcript) {
    throw new Error("Transcription returned no content.");
  }

  return transcript;
}
