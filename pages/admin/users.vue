<!-- Please remove this file from your project -->
<template>
  <div>
    <nav class="relative w-screen bg-gray-100 shadow-lg h-fit">
      <div class="flex justify-between p-2 items-center">
        <NuxtLink to="/admin" class="text-8 no-underline text-black font-bold"
          >Admin</NuxtLink
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
      <h1>人員</h1>
      <h2 class="py-2">活動列表</h2>
      <p v-if="isAdmin == 0">請滾</p>
      <div v-if="isAdmin == 1">
        <table class="table-fixed border border-collapse border-black w-full">
          <thead>
            <tr>
              <th class="w-1/6 border border-black">名字</th>
              <th class="border border-black">學號</th>
              <th class="border border-black">班級</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in users">
              <td class="border border-black">{{ item.name }}</td>
              <td class="border border-black">{{ item.id }}</td>
              <td class="border border-black">{{ item.classname }}</td>
            </tr>
          </tbody>
        </table>
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
      users: [],
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
    async getUsers() {
      this.$fire.firestore.collection('user-nid').onSnapshot((res) => {
        this.users = res.docs.map((item) => ({
          name: item.data().name,
          classname: item.data().classname,
          id: item.data().id,
        }))
      })
    },
  },
  mounted() {
    this.$fire.auth.onAuthStateChanged((user) => {
      if (user) {
        this.loginStatus = 1
        this.uid = user.uid
        this.getIsAdmin()
        this.getUsers()
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
