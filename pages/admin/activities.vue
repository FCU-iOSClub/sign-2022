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
      <h1>活動設定 Admin</h1>
      <h2 class="py-2">活動列表</h2>
      <p v-if="isAdmin == 0">請滾</p>
      <div v-if="isAdmin == 1">
        <table class="table-fixed border border-collapse border-black w-full">
          <thead>
            <tr>
              <th class="w-1/6 border border-black">活動名稱</th>
              <th class="border border-black">開始</th>
              <th class="border border-black">結束</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in activities">
              <td class="border border-black">{{ item.name }}</td>
              <td class="border border-black">
                {{ item.startTime.toDate().toLocaleString('zh-tw') }}
              </td>
              <td class="border border-black">
                {{ item.endTime.toDate().toLocaleString('zh-tw') }}
              </td>
            </tr>
          </tbody>
        </table>
        <h2 class="py-2">新增活動</h2>
        <form class="flex flex-col gap-2">
          <div class="flex gap-2">
            <label>活動名稱</label>
            <input type="text" v-model="inputActName" placeholder="活動名稱" />
          </div>
          <div class="flex gap-2">
            <label>開始時間</label>
            <input type="datetime-local" v-model="inputActStartTime" />
          </div>
          <div class="flex gap-2">
            <label>結束時間</label>
            <input type="datetime-local" v-model="inputActEndTime" />
          </div>
          <button
            @click="submitNewActivite"
            type="button"
            class="py-2 px-4 rounded-md bg-blue border-0 w-fit"
          >
            新增
          </button>
        </form>
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
      activities: {},
      inputActName: '',
      inputActStartTime: '',
      inputActEndTime: '',
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
    async getActivities() {
      this.$fire.firestore.collection('activities').onSnapshot((res) => {
        this.activities = res.docs.map((item) => ({
          name: item.data().name,
          startTime: item.data().startTime,
          endTime: item.data().endTime,
        }))
      })
    },
    async submitNewActivite() {
      this.$fire.firestore
        .collection('activities')
        .add({
          name: this.inputActName,
          startTime: this.$fireModule.firestore.Timestamp.fromDate(
            new Date(this.inputActStartTime)
          ),
          endTime: this.$fireModule.firestore.Timestamp.fromDate(
            new Date(this.inputActEndTime)
          ),
        })
        .then((d) => console.log(d))
        .catch((e) => console.log(e))
    },
  },
  mounted() {
    this.$fire.auth.onAuthStateChanged((user) => {
      if (user) {
        this.loginStatus = 1
        this.uid = user.uid
        this.getIsAdmin()
        this.getActivities()
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
