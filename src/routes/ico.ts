import type { APIRoute } from "astro";
import config from "virtual:astro-favicon-kit";
import { buildIco } from "../core/ico";
import { rasterizePng } from "../core/rasterize";
import { assetResponse } from "../core/respond";
import { loadSource } from "../core/source";

export const prerender = true;

const GET: APIRoute = async () => {
	const svg = await loadSource(config);
	const pngs = await Promise.all(config.icoSizes.map((size) => rasterizePng(svg, size)));
	return assetResponse(buildIco(pngs, config.icoSizes), "image/x-icon");
};

export { GET };
