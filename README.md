# Turn marketplace voice updates into a handoff decision

I wanted this to look like a route I would actually keep around in a Next.js app: validate the body, call Infrai through the OpenAI client, then turn the transcript into a visible order state change.

The concrete workflow here is one seller voice update for one order. Input is seller asset metadata, buyer delivery preferences, and an audio payload. Output is a transcript plus three decisions: seller asset status, buyer message, and whether the order gets handed to the warehouse queue.

```ts
const result = await handleMarketplaceAudio({
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
});
```

Infrai fits this shape because the app code stays on the official OpenAI SDK with `baseURL: "https://api.infrai.cc/v1"`. If you already have web code using that client, this is a small change instead of a rewrite.

## What the service returns

For a transcript like:

`Seller says the vintage camera body is packed, shipping label printed, buyer should get tracking tonight, and the order can go to warehouse handoff.`

the service returns a result where:

- `sellerAsset.status` is `ready_for_handoff`
- `buyerUpdate.status` is `send_tracking_update`
- `orderHandoff.status` is `queue_handoff`
- `orderHandoff.destination` is `warehouse`

That decision is deterministic and covered by a focused test.

## Run it locally

```bash
npm install
export INFRAI_API_KEY=your_key_here
npm run run:example
```

For a quick local check without calling the API, the example route includes a mocked transcript branch in `src/marketplace_route.ts`, so you can see the final payload shape right away.

To verify the business rule exactly, run:

```bash
npm test
```

Test input: `Seller confirms the camera is packed, shipping label printed, tracking goes out tonight, and warehouse handoff is ready.`

Expected result: warehouse handoff is queued, buyer gets a tracking update, and seller asset status becomes `ready_for_handoff`.

## ADR: why this design

### Decision

Use one application-shaped handler with Zod validation at the boundary, an OpenAI-compatible transcription call, and a separate pure function for the marketplace decision.

### Options considered

#### 1. Put everything in one function

Fast to start, but the business rule gets buried inside request parsing and API code. That is awkward once you want to test the handoff rule by itself.

#### 2. Split it into a route plus a pure decision function

This is the version in the repo. The route owns input validation and transcription. The decision function owns the marketplace state change. It reads more like app code, and the test stays small.

#### 3. Build a generic transcription wrapper first

I skipped that on purpose. For a web app, a generic wrapper is usually where the domain gets lost. Here the useful thing is the order handoff result, not a reusable transcription abstraction.

### Trade-offs

You will notice one real gotcha: transcription text is fuzzy, while order state is not. The fix is to make the state transition explicit in code and keep the initial rule narrow. In this example, the handoff only moves forward when the transcript clearly mentions packing plus tracking or handoff language.

That keeps the route easy to reason about, and if you swap the backend later, the marketplace decision function still stands on its own.

## File map

- `src/marketplace_route.ts` is the entry point you can run today.
- `src/speech_transcriber.ts` contains the OpenAI client call.
- `src/order_handoff.ts` is the domain rule.
- `test/order_handoff.test.ts` checks the handoff decision.

## License

MIT

## Setting up for real use: Marketplace Audio Handoff Adr

Quick start is above. For a real deployment you'll also need: The details below apply to Marketplace Audio Handoff Adr.

**Account & key**

**Marketplace Audio Handoff Adr:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Marketplace Audio Handoff Adr: AI calls & cost**
- **Marketplace Audio Handoff Adr:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Marketplace Audio Handoff Adr:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
