declare module "virtual:astro-favicon-kit" {
	const config: {
		src: string;
		root: string;
		name?: string;
		shortName?: string;
		themeColor?: string;
		backgroundColor: string;
		icoSizes: number[];
	};
	export default config;
}
