<template>
  <div class="winner">
    <div class="Title">
      <h1>You Loss!!</h1>
    </div>
    <h2>相手の数字は{{ winnerNumber }}でした</h2>

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

    this.predictionsRef = this.firestore.collection('predictions')
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
    submitPredictNumber: function () {
      var predictNumber = this.$data.predictNumber
      if (predictNumber === '' || predictNumber.length !== 4 || predictNumber.match(/[^0-9]+/)) {
        alert('数字を4文字にしてください！')
        return
      }

      var result = this.eatBiteCheck(predictNumber)

      this.predictionsRef.add({
        predictNumber: predictNumber,
        user: firebase.auth().currentUser.uid,
        eat: result.eat,
        bite: result.bite,
        match: this.$route.params.id,
        created_at: Date.now()
      }).then(data => {
        this.$data.predictNumber = ''
      }).catch(
        e => alert(e)
      )
    },
    eatBiteCheck: function (number) {
      var result = {eat: 0, bite: 0}
      var targetNumber = this.$data.targetNumber

      for (var i = 0; i < number.length; i++) {
        // eatの計算
        if (targetNumber[i] === number[i]) {
          result.eat = result.eat + 1
        }
      }

      // biteの計算
      var uniqNumber = number.split('').filter(function (x, i, self) {
        return self.indexOf(x) === i
      })

      for (var n = 0; n < uniqNumber.length; n++) {
        // eatの計算
        if (targetNumber.includes(uniqNumber[n])) {
          result.bite = result.bite + 1
        }
      }

      return result
    },
    startTimer: function () {
      this.$data.countTimer = this.$data.countTimer - 1

      if (this.$data.countTimer === 0) {
        var matchId = this.$route.params.id
        clearInterval(this.$options.interval)
        this.matchesRef.doc(matchId).get().then(doc => {
          doc.ref.update({
            winner: this.$data.predictList['opponentUser']['user']
          })
        })
      }
    }
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
