// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	css: ['~/assets/css/tailwind.css'],
	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {}
		}
	},
	devtools: { enabled: true },
	app: {
		// Uygulama altdizinde yayınlanacağı için baseURL ayarı
		baseURL: '/projects/rice-calculator/'
	},
	// Statik üretim için tüm rotaları önceden oluştur
	routeRules: {
		'/**': { prerender: true }
	},
	nitro: {
		prerender: {
			routes: ['/']
		}
	}
})


