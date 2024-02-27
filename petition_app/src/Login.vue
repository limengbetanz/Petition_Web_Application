<template>
    <div class="login">
        <transition name="modal">
            <div class="modal-mask">
                <div class="modal-wrapper">
                    <div class="modal-container">
                        <span class="glyphicon glyphicon-remove" id="delete-btn" @click="$emit('dismiss')"></span>
                        <div class="modal-header">
                            <slot name="header">
                                <div>
                                    <div class="header-title" v-if="!showSignUp">
                                        Log in
                                    </div>
                                    <div class="header-title" v-else>
                                        Sign up
                                    </div>
                                    <div class="header-subtitle" v-if="!showSignUp">
                                        Don't have an account? 
                                        <a class="sign-up-btn" @click="clickShowSignUp()">Sign up</a>
                                    </div>
                                    <div class="header-subtitle" v-else>
                                        Already have an account? 
                                        <a class="sign-up-btn" @click="clickShowLogin()">Log in</a>
                                    </div>
                                </div>
                            </slot>
                        </div>

                        <div class="modal-body">
                            <slot name="body">
                                <form @submit.prevent="login()" v-if="!showSignUp">
                                    <input type="text" id="fname" name="fname"  v-model="email" placeholder="Email">
                                    <span style="color:red;">* </span><br><br>

                                    <input type="password" id="lname" name="lname" v-model="password" placeholder="Password">
                                    <span style="color:red;">* </span><br><br>

                                    <input type="submit" id="submit" value="Log in">
                                </form>
                                <form @submit.prevent="signUp()" v-if="showSignUp">
                                    <input type="text" id="fname" name="fname" v-model="username" placeholder="User name">
                                    <span style="color:red;">* </span><br><br>

                                    <input type="text" id="fname" name="fname" v-model="email" placeholder="Email">
                                    <span style="color:red;">* </span><br><br>

                                    <input type="password" id="lname" name="lname" v-model="password" placeholder="Password">
                                    <span style="color:red;">* </span><br><br>

                                    <input type="text" id="fname" name="fname" v-model="city" placeholder="City">
                                    <span style="color:#00000000;">* </span><br><br>

                                    <input type="text" id="fname" name="fname" v-model="country" placeholder="Country">
                                    <span style="color:#00000000;">* </span><br><br>

                                    <p> Choose Profile Image:</p>
                                    <input type="file" id="fname-profile-photo" name="fileContent" @change="onFileChanged" accept="image/jpg,image/jpeg,image/gif,image/png">
                                    <br><br>

                                    <input type="submit" id="submit" value="Sign up">

                                </form>
                            </slot>
                        </div>
                    </div>
                </div>
            </div>
      </transition>
    </div>
</template>

<script>
    export default {
        data(){
            return {
                rootUrl: "http://localhost:4941/api/v1/users/",
                showSignUp: false,
                username: "",
                password: "",
                email: "",
                city: "",
                country: "",
                changedPhoto: null
            }
        },

        methods: {
            clickShowSignUp: function() {
                this.showSignUp = true;
                this.email = "";
                this.password = "";
            },

            clickShowLogin: function() {
                this.showSignUp = false;
                this.email = "";
                this.password = "";
            },

            signUp: function() {
                if(this.username.length === 0)
                {
                    alert("Please input a username");
                    return;
                }

                if(this.email.length === 0)
                {
                    alert("Please input an email address");
                    return;
                }

                if(this.password.length === 0)
                {
                    alert("Please input a password");
                    return;
                }

                let postBody = {};
                postBody["name"] = this.username;
                postBody["email"] = this.email;
                postBody["password"] = this.password;
                if(this.city.length !== 0)
                {
                    postBody["city"] = this.city;
                }
                if(this.country.length !== 0)
                {
                    postBody["country"] = this.country;
                }

                this.$http.post(this.rootUrl + 'register', postBody)
                .then((response) => {
                    this.login();
                })
                .catch((error) => {
                    alert(error.response.statusText);
                });
            },

            login: function() {
                if(this.email.length === 0)
                {
                    alert("Please input an email address");
                    return;
                }

                if(this.password.length === 0)
                {
                    alert("Please input a password");
                    return;
                }

                let postBody = {};
                postBody["email"] = this.email;
                postBody["password"] = this.password;

                this.$http.post(this.rootUrl + 'login', postBody)
                .then((response) => {
                    let user = { userId:response.data.userId, 
                                 session:response.data.token,
                                 email: this.email};
                    this.$cookies.remove('seng365_cookie');
                    this.$cookies.set('seng365_cookie', user, 60 * 60 * 24 * 7);
                    if(this.changedPhoto)
                    {
                        this.uploadPhoto();
                    }
                    else
                    {
                        alert("Log in successfully!");
                        this.$emit('dismiss');
                        this.$emit('login');
                    }
                })
                .catch((error) => {
                    alert(error.response.statusText);
                });
            },

            onFileChanged: function(event) {
                this.changedPhoto = event.target.files[0];
            },

            uploadPhoto: function() {
                if(!this.changedPhoto)
                {
                    return;
                }
                let filename = this.changedPhoto.name;
                let extension = filename.split(".")
                if(extension.length < 2)
                {
                    alert("Wrong image filename!")
                    return;
                }
                let contentType = "image/" + extension[extension.length - 1];
                if(contentType == "image/jpg")
                {
                    contentType = "image/jpeg";
                }
                this.$http.put(this.rootUrl + this.$cookies.get('seng365_cookie').userId + '/photo', this.changedPhoto, {
                    headers: {'X-Authorization': this.$cookies.get("seng365_cookie").session,
                               "Content-Type": contentType}
                })
                .then((response) => {
                    alert("Log in successfully!");
                    this.$emit('dismiss');
                    this.$emit('login');
                })
                .catch((error) => {
                    alert(error.response.statusText);
                });
            },
        }
    }
</script>

<style>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 400px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
    float: right;
}

#delete-btn {
    float:right;
}

.header-title {
    font-size: x-large;
    font-weight: bold;
}

.header-subtitle {
    margin-top:5px;
    font-size: small;
    font-weight: bold;
}

.sign-up-btn {
    cursor:pointer;
    pointer-events: auto;
    text-decoration:underline;
}

#fname {
    padding-left: 8px;
    width: 90%;
    height:40px;
}

#lname {
    padding-left: 8px;
    width: 90%;
    height:40px;
}

#submit {
    background-color: #AA0000;
    color: #EEEEEE;
    width: 90%;
    height:40px;
    font-weight: bold;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

</style>