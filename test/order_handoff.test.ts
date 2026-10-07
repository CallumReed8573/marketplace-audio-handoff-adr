import test from "node:test";
import assert from "node:assert/strict";
import { decideMarketplaceActions } from "../src/order_handoff";
import type { MarketplaceAudioRequest } from "../src/marketplace_types";

const request: MarketplaceAudioRequest = {
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

test("queues warehouse handoff when transcript confirms packed item and tracking", () => {
  const transcript =
    "Seller confirms the camera is packed, shipping label printed, tracking goes out tonight, and warehouse handoff is ready.";

  const result = decideMarketplaceActions(request, transcript);

  assert.equal(result.sellerAsset.status, "ready_for_handoff");
  assert.equal(result.buyerUpdate.status, "send_tracking_update");
  assert.equal(result.orderHandoff.status, "queue_handoff");
  assert.equal(result.orderHandoff.destination, "warehouse");
});
