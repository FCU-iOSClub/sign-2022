<!-- Please remove this file from your project -->
<template>
  <div>
    <h1 v-if="loginStatus == -1">Loading</h1>
    <h1 v-else-if="loginStatus == 1">Already Login</h1>
    <button v-else @click="login">Login With Google</button>
    <p v-if="loginStatus == 1">{{ userEmail }}</p>

    <button v-if="loginStatus == 1" @click="signOut">Sign Out</button>
  </div>
</template>

<script>
import { onMounted } from 'vue'

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
    async signOut() {
      this.$fire.auth.signOut()
    },
  },
  mounted() {
    this.$fire.auth.onAuthStateChanged((user) => {
      if (user) {
        this.loginStatus = 1
        this.userEmail = user.email
      } else {
        this.loginStatus = 0
      }
    })
  },
}
</script>
