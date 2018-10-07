<template>
  <div class="matching">
    <h2>マッチング中</h2>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'GameMatching',
  created () {
    this.firestore = firebase.firestore()
    const settings = {timestampsInSnapshots: true}
    this.firestore.settings(settings)
    this.numbersRef = this.firestore.collection('numbers')
    this.matchesRef = this.firestore.collection('matches')

    this.numbersRef.where('matched', '==', false).orderBy('created_at').onSnapshot(
      ss => {
        ss.docChanges().forEach(change => {
          if (change.type === 'added') {
            // let doc = change.doc
            // this.matchesRef.add({
            //
            // }).then(
            //   this.$router.push('/game/match')
            // ).catch(
            //   e => alert(e)
            // )
          }
        })
      }
    )
  },
  data () {
    return {
      numbersList: []
    }
  },
  methods: {
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
.matching {
  margin-top: 20px;

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center
}
input {
  margin: 10px 0;
  padding: 10px;
}
</style>
