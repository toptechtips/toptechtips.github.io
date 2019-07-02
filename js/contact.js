var firebaseConfig = {
  apiKey: "AIzaSyB_jbGjCd59FuB8ApQcaaFsO0Iculngr2E",
  authDomain: "toptechtips-20332.firebaseapp.com",
  databaseURL: "https://toptechtips-20332.firebaseio.com",
  projectId: "toptechtips-20332",
  storageBucket: "toptechtips-20332.appspot.com",
  messagingSenderId: "205720991480",
  appId: "1:205720991480:web:e3747b4f9d91b28d"
};

firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

db.collection("messages").add({
    email: "test@gmail.com",
    message: "Test message",
    timestamp: Date.now()
})
.then(function(docRef) {
    console.log("Document written with ID: ", docRef.id);
})
.catch(function(error) {
    console.error("Error adding document: ", error);
});
