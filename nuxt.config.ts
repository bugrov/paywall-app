// https://nuxt.com/docs/api/configuration/nuxt-config
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
        { name: 'theme-color', content: '#1B1F4B' }
      ]
    }
  },
  fonts: {
    families: [
      // latin-ext нужен ради знака ₽ (U+20BD), его нет в cyrillic и latin
      { name: 'Unbounded', provider: 'google', weights: [700], subsets: ['cyrillic', 'latin', 'latin-ext'] },
      { name: 'Onest', provider: 'google', weights: [400, 600, 700], subsets: ['cyrillic', 'latin', 'latin-ext'] }
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
