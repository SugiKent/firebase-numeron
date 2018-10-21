<template>
  <div class="number">
    <div v-if="matching">
      <h2>マッチング中</h2>
    </div>

    <div v-else>
      <h2>3桁のあなたの数字を決めましょう</h2>
      <input type="tel" placeholder="3桁のあなたの数字" max-length="3" v-model="number">
      <div class="button">
        <button @click="submitNumber">ゲーム開始</button>
      </div>
    </div>

  </div>

</template>

<script>
import firebase from 'firebase'

export default {
  name: 'GameReady',
  created () {
    this.firestore = firebase.firestore()
    const settings = {timestampsInSnapshots: true}
    this.firestore.settings(settings)
    this.numbersRef = this.firestore.collection('numbers')
    this.matchesRef = this.firestore.collection('matches')

    var user = firebase.auth().currentUser
    this.$data.timestamp = Date.now()

    this.matchesRef.where('finished', '==', false).where('created_at', '>', this.$data.timestamp).orderBy('created_at', 'desc').onSnapshot(
      ss => {
        ss.docChanges().forEach(change => {
          if (change.type === 'added') {
            let doc = change.doc.data()
            const matchStart = (doc.user1 === user.uid || doc.user2 === user.uid)

            if (matchStart) {
              this.$router.push('/game/battle/' + doc.urlId)
            }
            return true
          }
        })
      }
    )
  },
  data () {
    return {
      number: '',
      nowDate: '',
      matching: false,
      timestamp: ''
    }
  },
  methods: {
    submitNumber: function () {
      if (this.$data.number === '' || this.$data.number.length !== 3) {
        alert('数字を3文字にしてください！')
        return
      }

      var splitedNumber = this.$data.number.split('').filter(function (x, i, self) {
        return self.indexOf(x) === i
      })

      if (splitedNumber.length !== 3) {
        alert('同じ数字は入力できません。')
        return
      }

      this.$data.matching = true
      this.$data.timestamp = Date.now()

      this.numbersRef.add({
        number: this.$data.number,
        user: firebase.auth().currentUser.uid,
        created_at: Date.now(),
        matched: false
      }).then(data => {

      }).catch(
        e => {
          alert(e)
          this.$data.matching = false
        }
      )
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
.number {
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
</style>
