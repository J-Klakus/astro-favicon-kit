const CACHE = "public, max-age=604800";

export function assetResponse(body: Uint8Array | string, contentType: string): Response {
	// Buffer is a valid Response body at runtime; the cast sidesteps the
	// Uint8Array<ArrayBufferLike> vs BodyInit generic mismatch in @types/node.
	return new Response(body as unknown as BodyInit, {
		headers: { "content-type": contentType, "cache-control": CACHE },
	});
}
