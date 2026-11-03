import type { APIRoute } from "astro";
import config from "virtual:astro-favicon-kit";
import { rasterizePng } from "../core/rasterize";
import { assetResponse } from "../core/respond";
import { loadSource } from "../core/source";

export const prerender = true;

const GET: APIRoute = async () => {
	const svg = await loadSource(config);
	return assetResponse(await rasterizePng(svg, 192), "image/png");
};

export { GET };
