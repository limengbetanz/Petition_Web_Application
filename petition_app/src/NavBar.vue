<template>
    <div>
        <div class="nav-bar">
            <div class="nav-content">
                <span class="nav-name" style="cursor:pointer; pointer-events: auto;"@click="navToHome">Seng365.petition.com</span>
  
                <span class="nav-start-petition">
                     <a style="color: #AA0000" @click="navToStartPetition">Start a petition</a>
                </span>

                <span class="nav-my-petition">
                     <a style="color: #AA0000" @click="navToMyPetitions" >My petitions</a>
                </span>

                <div v-if="!alreadyLogged" @click="showLoginModal = true">
                    <a class="nav-login">Log in</a>
                </div>
                <div v-else>
                    <img class="nav-thumbnail" :src="profilePic" data-toggle="collapse" data-parent="#accordion" href="#collapseTwo">
                    <div class="profile-container" id="accordion">
                        <div id="collapseTwo" class="panel-collapse collapse">
                            <ul class="list-group">
                                <li class="list-group-item" id="settings">
                                    <a @click="navToSettings" style="color: #222222;">Settings</a>
                                </li>
                                <li class="list-group-item" id="logout">
                                    <a @click="logout" style="color: #AA0000;">Log out</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div class="nav-divider"></div>
        </div>

        <div>
            <loginModule v-if="showLoginModal" @dismiss="showLoginModal = false" @login="refresh"></loginModule>
        </div>

    </div>
</template>

<script>
    import loginModule from './Login.vue'
    import defaultThumbnail from "./assets/default_thumbnail.svg"

    export default {
        data(){
            return {
                showLoginModal: false,
                alreadyLogged: false,
                profilePic: null
            }
        },

        components: {
            loginModule
        },

        mounted: function(){
            this.refresh();
        },

        methods: {
            refresh: function() {
                let cookie = this.$cookies.get("seng365_cookie");
                if(cookie)
                {
                    if(cookie.session)
                    {
                        this.alreadyLogged = true;
                        this.profilePic = defaultThumbnail;
                        this.getProfileUrl();
                    }
                }
                else
                {
                    this.alreadyLogged = false;
                    this.profilePic = defaultThumbnail;
                }
            },
            
            loginEventCallback: function() {
                this.refresh();
                this.$router.push({ path: "/petitions"});
            },

            getProfileUrl: function() {
                let userId = this.$cookies.get("seng365_cookie").userId;
                let url = "http://localhost:4941/api/v1/users/" + userId + "/photo";
                this.$http.get(url)
                .then((response) => {
                    this.profilePic = url;
                })
                .catch((error) => {
                    if(response.status != 404)
                    {
                        alert(error.response.statusText);
                    }
                });
            },

            logout: function() {
                this.$http.post("http://localhost:4941/api/v1/users/logout", "", {
                    headers: {'X-Authorization': this.$cookies.get("seng365_cookie").session}
                })
                .then((response) => {
                    alert("Log out successfully!");
                    this.$cookies.remove('seng365_cookie');
                    this.refresh();
                    this.$router.push({ path: "/petitions"});
                })
                .catch((error) => {
                    alert(error.response.statusText);
                });
            },

            navToSettings: function() {
                this.$router.push({ path: "/profile"});
            },

            navToStartPetition: function() {
                let cookie = this.$cookies.get("seng365_cookie");
                if(!cookie)
                {
                    this.showLoginModal = true;
                    return;
                }
                this.$router.push({ path: "/petition/creation"});
            },

            navToMyPetitions: function() {
                let cookie = this.$cookies.get("seng365_cookie");
                if(!cookie)
                {
                    this.showLoginModal = true;
                    return;
                }
                this.$router.push({ path: "/myPetitions"});
            },

            navToHome: function() {
                this.$router.push({ path: "/petitions"});
            }
        }
    }
</script>

<style>
.nav-content {
    height:70px;
}

.nav-name {
    font-size: xx-large;
    font-weight: bold;
    color: #AA0000;
    float: left;
    margin-left: 80px;
}

.nav-start-petition {
    font-size: large;
    font-weight: bold;
    color: #AA0000;
    float: left;
    margin-left: 80px;
    margin-top: 12px;
    cursor:pointer; 
    pointer-events: auto;
}

.nav-my-petition {
    font-size: large;
    font-weight: bold;
    color: #AA0000;
    float: left;
    margin-left: 80px;
    margin-top: 12px;
    cursor:pointer; 
    pointer-events: auto;
}

.nav-login {
    font-size: large;
    font-weight: bold;
    color: #AA0000;
    float: right;
    margin-right: 80px;
    cursor:pointer;
    pointer-events: auto;
}

.nav-thumbnail {
    float: right;
    margin-right: 80px;
    width: 32px;
    height: 32px;
    border-radius:32px;
    background-size: cover;
}

.profile-container {
    float: right;
    margin-right: 20px;
    margin-top:-15px;
    width: 120px;
    font-weight: bold;
    cursor:pointer; 
    pointer-events: auto;
}

.nav-divider {
    background-color: #DDDDDD;
    height: 1px;
}

</style>