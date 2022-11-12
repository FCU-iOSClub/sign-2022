import presetUno from '@unocss/preset-uno'

export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'iOS Club 打卡系統',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ['@unocss/nuxt', '@nuxtjs/firebase'],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extractCSS: true,
  },

  // uno css
  unocss: {
    // presets
    presets: [presetUno()],

    // core options
    shortcuts: [],
    rules: [],
  },

  // firebase
  firebase: {
    config: {
      apiKey: 'AIzaSyBC7kva6e0kP7DfDB6qrT9_yGUXrrJzNNU',
      authDomain: 'singin-8db60.firebaseapp.com',
      projectId: 'singin-8db60',
      storageBucket: 'singin-8db60.appspot.com',
      messagingSenderId: '908520293073',
      appId: '1:908520293073:web:9eba9ab1b21ce0ace07bf0',
      measurementId: 'G-TMXWTR8KHB',
    },
    services: {
      auth: true,
      firestore: true,
    },
    auth: {
      persistence: 'local', // default
      initialize: {
        onAuthStateChangedMutation: 'ON_AUTH_STATE_CHANGED_MUTATION',
        subscribeManually: false,
      },
      ssr: false, // default
    },
  },
}
