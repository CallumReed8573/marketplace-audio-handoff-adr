import { z } from "zod";

export const MarketplaceAudioRequestSchema = z.object({
  orderId: z.string().min(1),
  handoffId: z.string().min(1),
  seller: z.object({
    sellerId: z.string().min(1),
    listingId: z.string().min(1),
    assetLabel: z.string().min(1),
  }),
  buyer: z.object({
    buyerId: z.string().min(1),
    preferredChannel: z.enum(["email", "sms", "in_app"]),
  }),
  audio: z.object({
    mimeType: z.string().min(1),
    base64: z.string().min(1),
  }),
});

export type MarketplaceAudioRequest = z.infer<typeof MarketplaceAudioRequestSchema>;

export type SellerAssetStatus = "ready_for_handoff" | "needs_seller_followup";
export type BuyerUpdateStatus = "send_tracking_update" | "send_processing_update";
export type OrderHandoffStatus = "queue_handoff" | "hold_handoff";

export type MarketplaceAudioResult = {
  orderId: string;
  transcript: string;
  sellerAsset: {
    sellerId: string;
    listingId: string;
    assetLabel: string;
    status: SellerAssetStatus;
  };
  buyerUpdate: {
    buyerId: string;
    preferredChannel: "email" | "sms" | "in_app";
    status: BuyerUpdateStatus;
    message: string;
  };
  orderHandoff: {
    handoffId: string;
    status: OrderHandoffStatus;
    destination: "warehouse" | "seller_queue";
  };
};
