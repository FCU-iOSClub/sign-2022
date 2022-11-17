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
      <h1>活動設定 Admin</h1>
      <h2 class="py-2">活動列表</h2>
      <p v-if="isAdmin == 0">請滾</p>
      <div v-if="isAdmin == 1">
        <select v-model="selectActivity">
          <option disabled value="">請選擇</option>
          <option v-for="item in activities" :value="item.id">
            {{ item.name }}
          </option>
        </select>
        <div v-if="selectedActivityAttendance.length > 0">
          <p class="py-4">人數：{{ selectedActivityAttendance.length }}</p>
          <button
            @click="exportCsv"
            class="border-0 bg-blue rounded-md text-3.5"
          >
            下載 CSV
          </button>
          <div class="h-5" />
          <table class="table-fixed border border-collapse border-black w-full">
            <thead>
              <tr>
                <th class="w-1/6 border border-black">學號</th>
                <th class="border border-black">系籍</th>
                <th class="border border-black">名字</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedActivityAttendance">
                <td class="border border-black">{{ item.nid }}</td>
                <td class="border border-black">
                  {{ item.classname }}
                </td>
                <td class="border border-black">
                  {{ item.name }}
                </td>
              </tr>
            </tbody>
          </table>
          <div class="h-8" />
        </div>
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
      selectActivity: '',
      selectedActivityAttendance: [],
      unsubscribeAttendance: () => {},
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
          id: item.id,
          name: item.data().name,
          startTime: item.data().startTime,
          endTime: item.data().endTime,
        })))
      })
    },
    async getAttendance(actID) {
      try {
        this.unsubscribeAttendance()
      } catch (e) {
        console.log(e.stack)
      }
      this.unsubscribeAttendance = this.$fire.firestore
        .collection('activities-sign')
        .doc(actID)
        .onSnapshot(async (doc) => {
          const data = doc.data()
          const uids = Object.keys(data)
          const users = []
          for (var userI = 0; userI < uids.length; userI += 10) {
            const uids_tmp = uids.slice(userI, userI + 10)
            const us = (
              await this.$fire.firestore
                .collection('user-nid')
                .where(
                  this.$fireModule.firestore.FieldPath.documentId(),
                  'in',
                  uids_tmp
                )
                .get()
            ).docs.map((item) => ({
              uid: item.id,
              name: item.data().name,
              nid: item.data().id,
              classname: item.data().classname,
            }))
            users.push(...us)
          }
          const att = uids.map((uid) => {
            const user = users.filter((u) => u.uid === uid)[0]
            return {
              uid: uid,
              name: user.name,
              nid: user.nid,
              classname: user.classname,
            }
          })
          this.selectedActivityAttendance = att
        })
    },
    exportCsv() {
      const rows = []
      this.selectedActivityAttendance.forEach((item) => {
        const row = []
        row.push(item.nid)
        row.push(item.classname)
        row.push(item.name)
        rows.push(row)
      })
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        rows.map((item) => item.join(',')).join('\n')
      const encodedUri = encodeURI(csvContent)
      window.open(encodedUri)
    },
  },
  watch: {
    selectActivity: {
      handler(newValue, _) {
        if (newValue !== '') this.getAttendance(newValue)
      },
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
