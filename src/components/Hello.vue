<template>
  <div class="hello">
    <h1>Numer0n</h1>
    <div class="button">
      <button @click="signIn">ゲームスタート！</button>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'Hello',
  created () {
    this.firestore = firebase.firestore()
    const settings = {timestampsInSnapshots: true}
    this.firestore.settings(settings)
  },
  methods: {
    signIn: function () {
      if (firebase.auth().currentUser) {
        this.$router.push('/game/ready')
      } else {
        firebase.auth().signInAnonymously().then(
          user => {
            var data = user.user
            firebase.firestore().collection('users').doc(data.uid).set({
              id: data.uid,
              created_at: Date.now(),
              waiting: false
            })
            this.$router.push('/game/ready')
          },
          err => {
            alert(err.message)
          }
        )
      }
    }
    // signOut: function () {
    //   firebase.auth().signOut().then(() => {
    //     this.$router.push('/')
    //   })
    // }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.button {
  margin: 10px auto;
}
button {
  padding: 5px 10px;
  border-radius: 5px;
  background-color: #fff;
  color: #333;
}
</style>
