<template>
  <div>
    <div class="scale-400 origin-top-left i-line-md-loading-twotone-loop" />
    <form class="invisible" ref="form" action="/api/nid_writedb" method="post">
      <input ref="accessToken" type="text" name="accessToken" />
      <input ref="uid" type="text" name="uid" />
      <input ref="submit" type="submit" value="Submit" />
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  mounted() {
    this.$fire.auth.onAuthStateChanged((user) => {
      if (user) {
        this.$refs.accessToken.value = user.auth.currentUser.accessToken
        this.$refs.uid.value = user.uid
        // send submit
        this.$refs.submit.click()
      } else {
        this.loginStatus = 0
      }
    })
  },
}
</script>
