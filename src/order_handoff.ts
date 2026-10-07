import type {
  MarketplaceAudioRequest,
  MarketplaceAudioResult,
} from "./marketplace_types";

function includesAny(text: string, terms: string[]): boolean {
  return terms.some((term) => text.includes(term));
}

export function decideMarketplaceActions(
  request: MarketplaceAudioRequest,
  transcript: string,
): MarketplaceAudioResult {
  const normalized = transcript.toLowerCase();
  const readyForHandoff =
    includesAny(normalized, ["packed", "ready", "shipping label printed"]) &&
    includesAny(normalized, ["tracking", "warehouse handoff", "handoff"]);

  const sellerStatus = readyForHandoff
    ? "ready_for_handoff"
    : "needs_seller_followup";
  const buyerStatus = readyForHandoff
    ? "send_tracking_update"
    : "send_processing_update";
  const handoffStatus = readyForHandoff ? "queue_handoff" : "hold_handoff";
  const destination = readyForHandoff ? "warehouse" : "seller_queue";

  const message = readyForHandoff
    ? `Your order ${request.orderId} is packed and tracking will be shared on ${request.buyer.preferredChannel}.`
    : `Your order ${request.orderId} is still being prepared. We'll send another update soon.`;

  return {
    orderId: request.orderId,
    transcript,
    sellerAsset: {
      sellerId: request.seller.sellerId,
      listingId: request.seller.listingId,
      assetLabel: request.seller.assetLabel,
      status: sellerStatus,
    },
    buyerUpdate: {
      buyerId: request.buyer.buyerId,
      preferredChannel: request.buyer.preferredChannel,
      status: buyerStatus,
      message,
    },
    orderHandoff: {
      handoffId: request.handoffId,
      status: handoffStatus,
      destination,
    },
  };
}
