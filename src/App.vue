<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'TBゴシック SL', 'TBGothic SL', 'HiraginoSans-W2', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #e5e5e5;
  padding-top: 60px;
  min-height: 100vh;
  height: 100%;
  background-color: rgb(4, 5, 36);
}
</style>
