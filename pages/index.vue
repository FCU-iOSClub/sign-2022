<!-- Please remove this file from your project -->
<template>
  <div>
    <nav
      class="bg-white shadow-md m-0 px-3 py-1 flex flex-row justify-between content-center"
    >
      <NuxtLink to="/" class="text-8 no-underline text-black"
        >iOS Club</NuxtLink
      >
      <span
        v-if="loginStatus == 0"
        @click="login"
        class="w-fit py-3 px-6 rounded-full break-normal bg-blue-300 cursor-pointer"
      >
        登入
      </span>
      <span
        v-if="loginStatus == 1"
        @click="logout"
        class="w-fit py-3 px-6 rounded-full break-normal bg-blue-300 cursor-pointer"
      >
        登出
      </span>
    </nav>

    <h1 class="text-center">簽到系統</h1>
    <a
      v-if="loginStatus == 1"
      class="w-fit py-3 px-6 rounded-full break-normal bg-blue-300 cursor-pointer text-black no-underline"
      href="https://opendata.fcu.edu.tw/fcuOauth/Auth.aspx?client_id=638037929185.f4b4a8ed044a488c85074c7f9e5ada47.sign.iosclub.tw&client_url=https://sign.iosclub.tw/api/nid_callback"
    >
      Bind Nid
    </a>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginStatus: -1,
      userEmail: '',
    }
  },
  methods: {
    async login() {
      const provider = new this.$fireModule.auth.GoogleAuthProvider()
      this.$fire.auth.signInWithRedirect(provider)
    },
    async logout() {
      this.$fire.auth.signOut()
    },
  },
  mounted() {
    this.$fire.auth.onAuthStateChanged((user) => {
      if (user) {
        this.loginStatus = 1
        this.userEmail = user.email
        console.log(user)
      } else {
        this.loginStatus = 0
      }
    })
  },
  head() {
    return {
      bodyAttrs: {
        class: 'm-0',
      },
    }
  },
}
</script>
