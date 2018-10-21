<template>
  <div class="winner">
    <div class="Title">
      <h1>Congratulation!!</h1>
    </div>
    <h2>相手の数字は{{ loserNumber }}でした</h2>

    <div class="result">
      {{this.battleData.winnerCount}}手で決着しました。
    </div>

    <div class="button">
      <router-link to="/game/ready">リトライ</router-link>
    </div>

  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'GameWinner',
  created () {
    this.firestore = firebase.firestore()
    const settings = {timestampsInSnapshots: true}
    this.firestore.settings(settings)

    this.matchesRef = this.firestore.collection('matches')

    var matchId = this.$route.params.id

    this.matchesRef.doc(matchId).get().then(doc => {
      this.battleData = doc.data()

      if (this.battleData.winner === this.battleData.user1) {
        this.$data.winnerNumber = this.battleData.number1
        this.$data.loserNumber = this.battleData.number2
      } else {
        this.$data.winnerNumber = this.battleData.number2
        this.$data.loserNumber = this.battleData.number1
      }
    })
  },
  data () {
    return {
      battleData: {},
      winnerNumber: '',
      loserNumber: ''
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
.button {
  margin: 10px auto;
}
button {
  padding: 5px 10px;
  border-radius: 5px;
}
.result {
  margin: 30px auto;
}
</style>
