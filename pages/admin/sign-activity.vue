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
      <h1>活動打卡 Admin</h1>
      <p v-if="isAdmin == 0">請滾</p>
      <div v-if="isAdmin == 1">
        <!-- 選擇活動 -->
        <div>
          <h2>選擇活動</h2>
          <select v-model="inputActivityId">
            <option :value="item.id" v-for="item in activities">
              {{ item.name }}
            </option>
          </select>
          <p>
            ActivityID: {{ inputActivityId === '' ? 'EMPTY' : inputActivityId }}
          </p>
        </div>
        <!-- qrcode scanner -->
        <input type="text" v-model="inputUID" />
        <button @click="signUserToActivity">Sign</button>
        <p v-for="item in activitiesSignLog">{{ item.uid }}</p>
      </div>
    </main>
  </div>
</template>

<script>
import { kMaxLength } from 'buffer'

export default {
  data() {
    return {
      loginStatus: -1,
      uid: '',
      isAdmin: -1,
      activities: [],
      inputActivityId: '',
      inputUID: '',
      activitiesSignLog: [],
      activitiesSignLogUnsubscribe: {},
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
      this.$fire.firestore
        .collection('activities')
        .get()
        .then((res) => {
          this.activities = res.docs.map((item) => ({
            id: item.id,
            name: item.data().name,
            startTime: item.data().startTime,
            endTime: item.data().endTime,
          }))
          // trigger loading log
          this.inputActivityId = res.docs[0].id
          this.getActivitiesSignLog()
        })
    },
    async signUserToActivity() {
      this.$fire.firestore
        .collection('activities-sign')
        .doc(this.inputActivityId)
        .set(
          {
            [this.inputUID]:
              this.$fireModule.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        )
    },
    async getActivitiesSignLog() {
      try {
        this.activitiesSignLogUnsubscribe()
      } catch (e) {}
      this.activitiesSignLog = []
      this.activitiesSignLogUnsubscribe = this.$fire.firestore
        .collection('activities-sign')
        .doc(this.inputActivityId)
        .onSnapshot((doc) => {
          if (doc.exists) {
            const data = doc.data()
            this.activitiesSignLog = Object.keys(data).map((key) => ({
              uid: key,
            }))
          }
        })
    },
  },
  watch: {
    inputActivityId: {
      handler(_, newValue) {
        if (newValue !== '') {
          this.getActivitiesSignLog()
        }
      },
      deep: true,
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
