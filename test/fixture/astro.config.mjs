import { defineConfig } from "astro/config";
import favicons from "astro-favicon-kit";

export default defineConfig({
	integrations: [
		favicons({
			src: "./src/assets/favicon.svg",
			name: "Fixture Local",
			shortName: "Fixture",
			themeColor: "#1d4ed8",
			backgroundColor: "#ffffff",
		}),
	],
});
