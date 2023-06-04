import firebase from './config.js';

var authDB = firebase.database().ref('authenticate')
var regDB = firebase.database().ref("registration");

document.getElementById('login-form').addEventListener('submit',logInForm);

function logInForm(e){
        
        e.preventDefault();
        var username = document.getElementById('login-username').value;
        var password = document.getElementById('login-password').value;

        regDB.orderByChild("username").equalTo(username).once("value")
        .then((snapshot) => {
                if (snapshot.exists()) {
                        snapshot.forEach((childSnapshot) => {
                                const childData = childSnapshot.val();
                            if (childData.password === password) {
                                    console.log(childSnapshot)
                                        const userid = childSnapshot.key;
                                        console.log(userid);
                                        localStorage.setItem('userid', userid);
                                        // window.location.href = "index.html"; 
                                } else {
                                        alert("wrong credentials");
                                }
                        });
                } else {
                        alert("wrong credentials");
                }
  })
  .catch((error) => {
    console.error(error);
  });
       
}



