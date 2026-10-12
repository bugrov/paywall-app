export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/eslint', '@nuxt/fonts'],
  css: ['~/assets/scss/main.scss'],
  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Комета Кузя',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        // Экран открывается только из приложения, в поиске он не нужен
        { name: 'robots', content: 'noindex' },
        // Дублирует --color-night из main.scss: в meta переменную CSS не подставить, менять вместе
        { name: 'theme-color', content: '#1B1F4B' }
      ]
    }
  },
  // X-Frame-Options не ставим: экран может открываться во встроенном окне приложения
  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    }
  },
  fonts: {
    families: [
      // latin-ext нужен ради знака ₽ (U+20BD), его нет в cyrillic и latin
      { name: 'Unbounded', provider: 'google', weights: [700], styles: ['normal'], subsets: ['cyrillic', 'latin', 'latin-ext'] },
      { name: 'Onest', provider: 'google', weights: [400, 600, 700], styles: ['normal'], subsets: ['cyrillic', 'latin', 'latin-ext'] }
    ]
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Функции и миксины доступны в каждом <style lang="scss"> без ручного @use
          additionalData: '@use "~/assets/scss/mixins" as *;\n'
        }
      }
    }
  },
  typescript: { strict: true }
})
