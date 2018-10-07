<template>
  <div class="number">
    <h2>あなたの数字を決めましょう</h2>
    <input type="text" placeholder="あなたの数字" v-model="number">
    <p>
      <button @click="submitNumber">ゲーム開始</button>
    </p>
    <table>
      <tr v-for="( number, index ) in numbersList" :key='index'>
        <td>{{ number.number }}</td>
        <td>{{ ( new Date( number.created_at ) ).toString() }}</td>
        <td>{{ number.matched }}</td>
      </tr>
    </table>
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
  },
  data () {
    return {
      number: ''
    }
  },
  methods: {
    submitNumber: function () {
      if (this.$data.number === '') { return }
      this.numbersRef.add({
        number: this.$data.number,
        user: firebase.auth().currentUser.uid,
        created_at: Date.now(),
        matched: false
      }).then(
        this.$router.push('/game/matching')
      ).catch(
        e => alert(e)
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
</style>
