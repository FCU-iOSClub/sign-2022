<!-- Please remove this file from your project -->
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
      <h1 class="text-left">Admin</h1>
      <p v-if="isAdmin == 0">請滾</p>
      <div v-if="isAdmin == 1" class="flex flex-col gap-2">
        <!-- foreach admin functions -->
        <NuxtLink
          v-for="item in adminFunctions"
          :to="item.to"
          class="w-fit text-black text-5 no-underline rounded-full bg-blue-300 px-3 py-2"
        >
          {{ item.name }}
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loginStatus: -1,
      uid: '',
      isAdmin: -1,
      adminFunctions: [
        { name: '協助打卡', to: '/admin/sign-activity' },
        { name: '新增活動', to: '/admin/activities' },
        { name: '活動出席', to: '/admin/activities_attendance' },
        { name: '人員', to: '/admin/users' },
      ],
    }
  },
  methods: {
    async login() {
      const provider = new this.$fireModule.auth.GoogleAuthProvider()
      this.$fire.auth.signInWithRedirect(provider)
    },
    async logout() {
      this.$fire.auth.signOut()
      this.nid = 'NOT_INIT'
      this.nidName = 'NOT_INIT'
    },
    async getIsAdmin() {
      this.$fire.firestore
        .collection('admins')
        .doc(this.uid)
        .get()
        .then((doc) => {
          if (!doc.exists) {
            this.isAdmin = 0
            return
          }
          this.isAdmin = doc.data().admin ? 1 : 0
        })
        .catch((e) => {
          this.isAdmin = 0
        })
    },
  },
  mounted() {
    this.$fire.auth.onAuthStateChanged((user) => {
      if (user) {
        this.loginStatus = 1
        this.uid = user.uid
        this.getIsAdmin()
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
