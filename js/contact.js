(function() {
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

  var validate = function(name, email, msg){
    out = true
    if (name.validity.valid != true) {
      out = false
    } else if (email.validity.valid != true) {
      out = false
    } else if (msg.validity.valid != true) {
      out = false
    } else if (msg.value.length < 5) {
      out = false
    }
    return out
  }
  var push_to_firebase = function(data){
    alert("Thanks for sending a message. I'll try and get back to you as soon as possible.")
    var db = firebase.firestore();

    db.collection("messages").add({
        name: data["name"],
        email: data["email"],
        message: data["msg"],
        timestamp: Date.now()
    })
    .then(function(docRef) {
        console.log("Message sent, ID: ", docRef.id);
        location.reload();
    })
    .catch(function(error) {
        console.error("Message could not be sent: ", error);
    });
  }

  var contact_submit = function(){
    var name = document.getElementById("name_input");
    var email = document.getElementById("email_input");
    var msg = document.getElementById("msg_input");

    if (validate(name, email, msg) == false) {
      return alert("Please make sure all fields are valid and filled in.");
    } else {
      var data = {
        "name": name.value,
        "email": email.value,
        "msg": msg.value
      }
      push_to_firebase(data);
    }

  }

  document.getElementById("submit_msg").addEventListener("click", contact_submit);
})();
