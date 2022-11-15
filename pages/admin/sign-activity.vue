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
          <p>已打卡人數：{{ activitiesSignLog.length }}</p>
          <p>
            ActivityID：{{ inputActivityId === '' ? 'EMPTY' : inputActivityId }}
          </p>
        </div>
        <!-- input -->
        <div class="flex gap-2">
          <input type="text" v-model="inputUID" />
          <p>{{ inputUIDName }}</p>
          <button @click="signUserToActivity">送出</button>
        </div>
        <!-- qr code scanner -->
        <div class="w-full sm:w-1/4">
          <qrcode-stream @decode="onDecodeQR" @init="onInitQR" />
        </div>
        <!-- signed list -->
        <div class="flex gap-4" v-for="item in activitiesSignLog">
          <p>{{ item.time.toLocaleString() }}</p>
          <p>{{ item.name }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  components: {
    'qrcode-stream': async () => {
      const { QrcodeStream } = await import('vue-qrcode-reader')
      return QrcodeStream
    },
  },
  data() {
    return {
      loginStatus: -1,
      uid: '',
      isAdmin: -1,
      activities: [],
      inputActivityId: '',
      inputUID: '',
      inputUIDName: '',
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
      this.inputUID = ''
      this.inputUIDName = ''
    },
    async getUserNameByUID(uid) {
      const user = await this.$fire.firestore
        .collection('user-nid')
        .doc(uid)
        .get()
      return user.data().name
    },
    async getUserNamesByUIDs(uids) {
      const users = []
      console.log('1')
      for (var uidI = 0; uidI < uids.length; uidI += 10) {
        const s = await this.$fire.firestore
          .collection('user-nid')
          .where(
            this.$fireModule.firestore.FieldPath.documentId(),
            'in',
            uids.slice(uidI, uidI + 10)
          )
          .get()
        users.push(...s.docs)
      }
      var result = {}
      users.forEach((user) => {
        result[user.id] = user.data().name
      })
      return result
    },
    async getActivitiesSignLog() {
      try {
        this.activitiesSignLogUnsubscribe()
      } catch (e) {}
      this.activitiesSignLog = []
      this.activitiesSignLogUnsubscribe = this.$fire.firestore
        .collection('activities-sign')
        .doc(this.inputActivityId)
        .onSnapshot(async (doc) => {
          if (doc.exists) {
            const data = doc.data()
            const userNames = await this.getUserNamesByUIDs(Object.keys(data))
            const logs = Object.keys(data)
              .map((key) => ({
                uid: key,
                time: new Date(data[key].seconds * 1000),
                name: userNames[key],
              }))
              .sort((a, b) => b.time - a.time)
            this.activitiesSignLog = logs
          }
        })
    },
    async onInitQR(promiss) {
      try {
        await promiss
        console.log('QRcode reader ready')
      } catch (e) {
        console.log(e.stack)
      }
    },
    onDecodeQR(result) {
      console.log('QRcode reader decode: ' + result)
      this.inputUID = result
      this.getUserNameByUID(result).then((name) => {
        this.inputUIDName = name
      })
    },
  },
  watch: {
    inputActivityId: {
      handler(newValue, _) {
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
