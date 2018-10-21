<template>
  <div class="matching">
    <div class="count-timer">
      {{countTimer}}
    </div>
    <h2>あなたの数字{{ predictList['currentUser']['number'] }}</h2>
    <div v-if="currentUserTurn">
      <input type="tel" placeholder="相手の数字を予想しよう" max-length="3" v-model="predictNumber">
      <div class="button">
        <button @click="submitPredictNumber">ヌメロン！</button>
      </div>
    </div>

    <div v-else>
      <h4>相手の番です</h4>
    </div>

    <div class="predictions">
      <div class="currentUser">
        <h3>あなたの予想</h3>
        <table>
          <tr>
            <th>#</th>
            <th>予想数字</th>
            <th>Eat</th>
            <th>Bite</th>
          </tr>
          <tr v-for="(value, key, index) in predictList['currentUser']['predictions']" v-bind:key="index">
            <td>{{ index }}</td>
            <td>{{ value.predictNumber }}</td>
            <td>{{ value.eat }}</td>
            <td>{{ value.bite }}</td>
          </tr>
        </table>
      </div>
      <div class="opponentUser">
        <h3>あいての予想</h3>
        <table>
          <tr>
            <th>#</th>
            <th>予想数字</th>
            <th>Eat</th>
            <th>Bite</th>
          </tr>
          <tr v-for="(value, key, index) in predictList['opponentUser']['predictions']" v-bind:key="index">
            <td>{{ index }}</td>
            <td>{{ value.predictNumber }}</td>
            <td>{{ value.eat }}</td>
            <td>{{ value.bite }}</td>
          </tr>
        </table>
      </div>
    </div>

    <div class="predictions">
      <ul>
        <li>Eatは数字も位置もあっている数</li>
        <li>Biteは数字があっている数</li>
      </ul>
    </div>
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'GameBattle',
  created () {
    this.firestore = firebase.firestore()
    const settings = {timestampsInSnapshots: true}
    this.firestore.settings(settings)

    this.predictionsRef = this.firestore.collection('predictions')
    this.matchesRef = this.firestore.collection('matches')

    var matchId = this.$route.params.id

    this.matchesRef.doc(matchId).get().then(doc => {
      this.battleData = doc.data()

      if (this.battleData.user1 === firebase.auth().currentUser.uid) {
        this.$data.predictList['currentUser']['user'] = this.battleData.user1
        this.$data.predictList['opponentUser']['user'] = this.battleData.user2

        this.$data.predictList['currentUser']['number'] = this.battleData.number1
        this.$data.predictList['opponentUser']['number'] = this.battleData.number2
        this.$data.targetNumber = this.battleData.number2

        this.$data.currentUserTurn = false
      } else {
        this.$data.predictList['currentUser']['user'] = this.battleData.user2
        this.$data.predictList['opponentUser']['user'] = this.battleData.user1

        this.$data.predictList['currentUser']['number'] = this.battleData.number2
        this.$data.predictList['opponentUser']['number'] = this.battleData.number1
        this.$data.targetNumber = this.battleData.number1

        this.$data.currentUserTurn = true
        this.$data.countTimer = 90
        this.$options.interval = setInterval(this.startTimer, 1000)
      }
    })

    this.matchesRef.doc(matchId).onSnapshot(
      doc => {
        this.battleData = doc.data()
        if (this.battleData.winner === firebase.auth().currentUser.uid) {
          this.$router.push('/game/winner/' + this.battleData.urlId)
        } else if (this.battleData.winner !== '') {
          this.$router.push('/game/loser/' + this.battleData.urlId)
        }
      }
    )

    this.predictionsRef.where('match', '==', matchId).orderBy('created_at', 'asc').onSnapshot(
      ss => {
        ss.docChanges().forEach(change => {
          if (change.type === 'added') {
            var data = change.doc.data()
            if (data.user === firebase.auth().currentUser.uid) {
              this.$set(this.$data.predictList['currentUser']['predictions'], data.created_at, data)

              this.$data.currentUserTurn = false

              this.$data.countTimer = 90
              clearInterval(this.$options.interval)
            } else {
              this.$set(this.$data.predictList['opponentUser']['predictions'], data.created_at, data)

              this.$data.currentUserTurn = true

              this.$data.countTimer = 90
              this.$options.interval = setInterval(this.startTimer, 1000)
            }
          }
        })
      }
    )
  },
  data () {
    return {
      battleData: {},
      predictList: {
        'currentUser': {
          user: '',
          number: '',
          'predictions': {}
        },
        'opponentUser': {
          user: '',
          number: '',
          'predictions': {}
        }
      },
      currentUserTurn: true,
      predictNumber: '',
      targetNumber: '',
      countTimer: 90
    }
  },
  methods: {
    submitPredictNumber: function () {
      var predictNumber = this.$data.predictNumber
      if (predictNumber === '' || predictNumber.length !== 3) {
        alert('数字を3文字にしてください！')
        return
      }

      var splitedNumber = predictNumber.split('').filter(function (x, i, self) {
        return self.indexOf(x) === i
      })

      if (splitedNumber.length !== 3) {
        alert('同じ数字は入力できません。')
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
      var eated = []

      for (var i = 0; i < number.length; i++) {
        // eatの計算
        if (targetNumber[i] === number[i]) {
          result.eat = result.eat + 1
          eated.push(number[i])
        }
      }

      for (var n = 0; n < number.length; n++) {
        // eatの計算
        if (targetNumber.includes(number[n]) && !eated.includes(number[n])) {
          result.bite = result.bite + 1
        }
      }

      if (result.eat === 3) {
        var matchId = this.$route.params.id
        this.matchesRef.doc(matchId).get().then(doc => {
          doc.ref.update({
            winner: this.$data.predictList['currentUser']['user'],
            winnerCount: Object.keys(this.$data.predictList['currentUser']['predictions']).length + 1,
            loserCount: Object.keys(this.$data.predictList['opponentUser']['predictions']).length + 1
          })
        })
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
            winner: this.$data.predictList['opponentUser']['user'],
            winnerCount: Object.keys(this.$data.predictList['opponentUser']['predictions']).length,
            loserCount: Object.keys(this.$data.predictList['currentUser']['predictions']).length
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
  background-color: #fff;
  color: #333;
}
.currentUser {
  margin: 30px auto;
}
.predictions th {
  font-size: 20px;
  padding: 5px;
}
.predictions td {
  font-size: 20px;
  padding: 5px 10px;
}
</style>
