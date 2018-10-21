import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import GameReady from '@/components/Game/Ready'
import GameMatching from '@/components/Game/Matching'
import GameBattle from '@/components/Game/Battle'
import GameWinner from '@/components/Game/Winner'
import GameLoser from '@/components/Game/Loser'
import firebase from 'firebase'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/game/ready',
      name: 'GameReady',
      component: GameReady,
      meta: {requiresAuth: true}
    },
    {
      path: '/game/matching/:id',
      name: 'GameMatching',
      component: GameMatching,
      meta: {requiresAuth: true}
    },
    {
      path: '/game/battle/:id',
      name: 'GameBattle',
      component: GameBattle,
      meta: {requiresAuth: true}
    },
    {
      path: '/game/winner/:id',
      name: 'GameWinner',
      component: GameWinner,
      meta: {requiresAuth: true}
    },
    {
      path: '/game/loser/:id',
      name: 'GameLoser',
      component: GameLoser,
      meta: {requiresAuth: true}
    }
  ]
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  // このルートはログインされているかどうか認証が必要です。

  // もしされていないならば、ログインページにリダイレクトします。
  if (requiresAuth) {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        next()
      } else {
        next({
          path: '/',
          query: { redirect: to.fullPath }
        })
      }
    })
  } else {
    next()
  }
})

export default router
