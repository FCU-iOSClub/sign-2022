<template>
  <div>
    <nav class="relative w-screen bg-gray-100 shadow-lg h-fit">
      <div class="flex justify-between p-2 items-center">
        <NuxtLink to="/" class="text-8 no-underline text-black font-bold"
          >iOS Club</NuxtLink
        >
        <span
          v-if="loginStatus == 0"
          @click="login"
          class="w-fit py-3 px-6 rounded-full break-normal bg-blue-300 cursor-pointer"
        >
          Google 登入
        </span>
        <span
          v-if="loginStatus == 1"
          @click="logout"
          class="w-fit py-3 px-6 rounded-full break-normal bg-blue-300 cursor-pointer"
        >
          登出
        </span>
      </div>
    </nav>

    <main class="mx-2 md:mx-10 lg:mx-20">
      <h1 @click="goAdmin" class="text-left">打卡系統</h1>
      <!-- loading circle -->
      <div
        v-if="loginStatus == -1"
        class="scale-400 origin-left i-line-md-loading-twotone-loop"
      />
      <a
        v-if="loginStatus == 1 && nid === 'NOT_BIND'"
        class="shadow-md w-fit py-3 px-6 rounded-full break-normal bg-blue-300 cursor-pointer text-black no-underline"
        href="https://opendata.fcu.edu.tw/fcuOauth/Auth.aspx?client_id=638037929185.f4b4a8ed044a488c85074c7f9e5ada47.sign.iosclub.tw&client_url=https://sign.iosclub.tw/api/nid_callback"
      >
        Bind Nid
      </a>
      <!-- message -->
      <p v-if="loginStatus == 0">請先登入</p>
      <!-- if nid binded -->
      <div v-if="nid !== 'NOT_INIT' && nid !== 'NOT_BIND'">
        <p class="text-5">Hi, {{ nidName }} ({{ nid }})</p>
        <p class="sm:text-center">{{ now.toLocaleString() }}</p>
        <img
          v-bind:src="
            'https://api.qrserver.com/v1/create-qr-code/?size=300&data=' + uid
          "
          class="w-full sm:w-1/4"
        />
      </div>
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginStatus: -1,
      userEmail: '',
      uid: '',
      nid: 'NOT_INIT',
      nidName: 'NOT_INIT',
      now: new Date(),
      goAdminCount: 0,
    }
  },
  methods: {
    async login() {
      const provider = new this.$fireModule.auth.GoogleAuthProvider()
      this.$fire.auth.signInWithPopup(provider)
    },
    async logout() {
      this.$fire.auth.signOut()
      // clen value
      this.nid = 'NOT_INIT'
      this.nidName = 'NOT_INIT'
    },
    async getUserNidData() {
      this.$fire.firestore
        .collection('user-nid')
        .doc(this.uid)
        .get()
        .then((doc) => {
          if (!doc.exists) {
            // nid not bind
            this.nid = 'NOT_BIND'
            this.nidName = 'NOT_BIND'
            return
          }
          // nid binded
          const data = doc.data()
          this.nid = data.id
          this.nidName = data.name
        })
    },
    goAdmin() {
      this.goAdminCount++
      if (this.goAdminCount >= 5) {
        window.location = '/admin'
      }
    },
  },
  mounted() {
    setInterval(() => {
      this.now = new Date()
    }, 1000)
    this.$fire.auth.onAuthStateChanged((user) => {
      if (user) {
        this.loginStatus = 1
        this.uid = user.uid
        this.userEmail = user.email
        this.getUserNidData()
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
