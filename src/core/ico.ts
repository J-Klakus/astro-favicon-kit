/**
 * Assemble an ICO from PNG payloads. Modern Windows (Vista+) renders PNG
 * entries directly, and PNG compression keeps the file tiny compared to the
 * traditional 256px BMP entry (285KB → ~1.3KB in production use).
 */
export function buildIco(pngs: readonly Buffer[], sizes: readonly number[]): Buffer {
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0); // reserved
	header.writeUInt16LE(1, 2); // type: icon
	header.writeUInt16LE(pngs.length, 4);

	let offset = 6 + pngs.length * 16;
	const entries = pngs.map((png, i) => {
		const entry = Buffer.alloc(16);
		entry[0] = sizes[i] % 256; // width (0 encodes 256)
		entry[1] = sizes[i] % 256; // height
		entry.writeUInt16LE(1, 4); // colour planes
		entry.writeUInt16LE(32, 6); // bits per pixel
		entry.writeUInt32LE(png.length, 8);
		entry.writeUInt32LE(offset, 12);
		offset += png.length;
		return entry;
	});

	return Buffer.concat([header, ...entries, ...pngs]);
}
