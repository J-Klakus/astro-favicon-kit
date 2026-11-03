import type { APIRoute } from "astro";
import config from "virtual:astro-favicon-kit";
import { assetResponse } from "../core/respond";
import { loadSource } from "../core/source";

export const prerender = true;

const GET: APIRoute = async () => {
	const svg = await loadSource(config);
	// Byte-for-byte passthrough: designer-owned light/dark media queries survive.
	return assetResponse(svg, "image/svg+xml");
};

export { GET };
