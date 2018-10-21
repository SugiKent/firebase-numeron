const functions = require('firebase-functions')

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const admin = require('firebase-admin')
admin.initializeApp()
const firestore = admin.firestore()

const settings = {timestampsInSnapshots: true};
firestore.settings(settings);
const numbersCollection = firestore.collection('numbers')
const matchesCollection = firestore.collection('matches')

exports.createMatch = functions.firestore
  .document('numbers/{numberId}')
  .onCreate((snap, context) => {
    // Get an object representing the document
    // e.g. {'name': 'Marie', 'age': 66}
    const newValue = snap.data();

    // access a particular field as you would any JS property
    const number = newValue.number;
    const user = newValue.user;
    const created_at = newValue.created_at

    const numbers = numbersCollection.where('matched', '==', false).orderBy('created_at', 'asc')//.where('created_at', '<', created_at).where('created_at', '>', created_at)

    // すでにあるnumbersの中で、まだmatchedがtrueになっていない物を探す。
    numbers
      .get()
      .then( ss => {
        var doc = ss.docs[0]

        // docが2個以上かつ、最初のuserが自分では無い時
        // TODO: なぜか同じユーザーのnumberがマッチしてしまうときがある
        if (ss.docs.length > 1 && doc.data().user !== user) {

          console.log(ss.docs.length)

          var urlId = Math.floor( Math.random() * 10000000000000000000 ).toString()

          matchesCollection.doc(urlId).set({
            number1: doc.data().number,
            user1: doc.data().user,
            number2: number,
            user2: user,
            created_at: Date.now(),
            finished: false,
            winner: '',
            urlId: urlId
          }).then(
            console.log("match successfully created!:" + urlId)
          ).catch( error => {
            console.error("Error add matches documents: ", error)
          })

          doc._ref.update({
            matched: true
          })
          .then(
            console.log("newValue successfully updated!")
          ).catch( error => {
            // The document probably doesn't exist.
            console.error("Error updating number: ", error)
          })

          snap._ref.update({
            matched: true
          })
          .then(
            console.log("oldValue successfully updated!")
          ).catch( error => {
            // The document probably doesn't exist.
            console.error("Error updating number: ", error)
          })
        } else {
          // doc.data() will be undefined in this case
          console.log("Matchは作らずに終了")
        }

        return doc
      }).catch( error => {
        console.error("Error getting numbers documents: ", error)
      })


    // perform desired operations ...
    return number
  })
