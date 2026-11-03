import sharp from "sharp";

/** Rasterize an SVG to a square PNG of the given size, letterboxed if the source is not square. */
export async function rasterizePng(svg: Buffer, size: number): Promise<Buffer> {
	return sharp(svg, { density: svgDensity(svg, size) })
		.resize(size, size, {
			fit: "contain",
			background: { r: 0, g: 0, b: 0, alpha: 0 },
		})
		.png()
		.toBuffer();
}

/**
 * Pick a render DPI so the SVG rasterizes near the target size instead of at its
 * intrinsic 72dpi size (a 24px intrinsic SVG upscaled to 512 would blur otherwise).
 */
function svgDensity(svg: Buffer, targetSize: number): number {
	const head = svg.subarray(0, 2048).toString("utf8");
	const intrinsic = intrinsicSize(head);
	if (!intrinsic) return 300;
	return Math.min(4096, Math.max(72, (72 * targetSize) / intrinsic));
}

function intrinsicSize(head: string): number | null {
	const w = /<svg[^>]*\bwidth\s*=\s*["']\s*([\d.]+)/i.exec(head);
	const h = /<svg[^>]*\bheight\s*=\s*["']\s*([\d.]+)/i.exec(head);
	if (w && h) {
		const size = Math.max(Number(w[1]), Number(h[1]));
		if (size > 0) return size;
	}
	const vb = /<svg[^>]*\bviewBox\s*=\s*["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)/i.exec(head);
	if (vb) {
		const size = Math.max(Number(vb[1]), Number(vb[2]));
		if (size > 0) return size;
	}
	return null;
}
