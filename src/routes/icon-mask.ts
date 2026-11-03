import type { APIRoute } from "astro";
import config from "virtual:astro-favicon-kit";
import { maskablePng } from "../core/canvas";
import { assetResponse } from "../core/respond";
import { loadSource } from "../core/source";

export const prerender = true;

const GET: APIRoute = async () => {
	const svg = await loadSource(config);
	return assetResponse(
		await maskablePng(svg, 512, config.backgroundColor),
		"image/png",
	);
};

export { GET };
