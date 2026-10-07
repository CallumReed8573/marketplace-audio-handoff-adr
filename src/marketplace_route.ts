import { transcribeMarketplaceAudio } from "./speech_transcriber";
import {
  MarketplaceAudioRequestSchema,
  type MarketplaceAudioResult,
} from "./marketplace_types";
import { decideMarketplaceActions } from "./order_handoff";

export async function handleMarketplaceAudio(
  input: unknown,
): Promise<MarketplaceAudioResult> {
  const request = MarketplaceAudioRequestSchema.parse(input);
  const transcript = await transcribeMarketplaceAudio(request);
  return decideMarketplaceActions(request, transcript);
}

async function runDemo(): Promise<void> {
  const demoInput = {
    orderId: "ord_2048",
    handoffId: "handoff_2048_v1",
    seller: {
      sellerId: "seller_88",
      listingId: "listing_vintage-camera",
      assetLabel: "Vintage camera body",
    },
    buyer: {
      buyerId: "buyer_19",
      preferredChannel: "sms",
    },
    audio: {
      mimeType: "audio/mp3",
      base64: "U29tZSBhdWRpbyBieXRlcy4=",
    },
  };

  const result = await handleMarketplaceAudio(demoInput);

  console.log(JSON.stringify(result, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
