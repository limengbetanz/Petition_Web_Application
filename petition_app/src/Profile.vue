<template>
  <div id="profile-page">
    <div>
        <navBarModule></navBarModule>
    </div>

    <div class="top">
        <div>
            <img class="profile-thumbnail" :src="userImage">
        </div>
        <p class="profile-name"> {{ name }} </p>
        <p class="profile-email"> {{ email }} </p>
        <p class="profile-city-country"> {{ cityCountry }} </p>
    </div>

    <div class="bottom">
        <div class="general-info-container" id="accordion">
            <div class="panel panel-default">
                <div class="panel-heading" id="general-info-title">
                    <h4 class="panel-title">
                        <div>
                            <a data-toggle="collapse" data-parent="#accordion" href="#collapseGeneral" id="profile-list-element" style="font-weight: bold;">
                                Change general information
                            </a>
                        </div>
                    </h4>
                </div>

                <div id="collapseGeneral" class="panel-collapse collapse">
                    <ul class="list-group">
                        <li class="list-group-item" id="change-name">
                            <form @submit.prevent="changeGeneralInfo()">
                                <div class=item-container>
                                    <p class="change-tip">New Name: </p>
                                    <input type="text" id="fname-profile" name="fname" v-model="changedName" placeholder="User name">
                                </div>

                                <div class=item-container>
                                    <p class="change-tip">New Email Address: </p>
                                    <input type="text" id="fname-profile" name="fname" v-model="changedEmail" placeholder="Email">
                                </div>

                                <div class=item-container>
                                    <p class="change-tip">New City: </p>
                                    <input type="text" id="fname-profile" name="fname" v-model="changedCity" placeholder="City">
                                </div>

                                <div class=item-container>
                                    <p class="change-tip">New Country: </p>
                                    <input type="text" id="fname-profile" name="fname" v-model="changedCountry" placeholder="Country">
                                </div>

                                <input type="submit" id="submit-profile" value="Change">
                            </form>
                        </li>
                    </ul>
                </div>
                </div>
            </div>

            <div class="general-info-container" id="accordion">
            <div class="panel panel-default">
                <div class="panel-heading" id="general-info-title">
                    <h4 class="panel-title">
                        <div>
                            <a data-toggle="collapse" data-parent="#accordion" href="#collapsePassword" id="profile-list-element" style="font-weight: bold;">
                                Change password
                            </a>
                        </div>
                    </h4>
                </div>

                <div id="collapsePassword" class="panel-collapse collapse">
                    <ul class="list-group">
                        <li class="list-group-item" id="change-name">
                            <form @submit.prevent="changePassword()">
                                <div class=item-container>
                                    <p class="change-tip">New Passord: </p>
                                    <input type="password" id="fname-profile" name="fname" v-model="newPassword" placeholder="new password">
                                </div>

                                <div class=item-container>
                                    <p class="change-tip">Old Password: </p>
                                    <input type="password" id="fname-profile" name="fname" v-model="oldPassword" placeholder="old password">
                                </div>

                                <input type="submit" id="submit-profile" value="Change">
                            </form>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="panel panel-default">
                <div class="panel-heading" id="general-info-title">
                    <h4 class="panel-title">
                        <div>
                            <a data-toggle="collapse" data-parent="#accordion" href="#collapsePhoto" id="profile-list-element" style="font-weight: bold;">
                                Change Profile Photo
                            </a>
                        </div>
                    </h4>
                </div>

                <div id="collapsePhoto" class="panel-collapse collapse">
                    <ul class="list-group">
                        <li class="list-group-item" id="change-photo">
                            <form @submit.prevent="uploadPhoto">
                                <div class=item-container>
                                    <p class="change-tip"> Choose Profile Image:</p>
                                    <input type="file" id="fname-profile-photo" name="fileContent" @change="onFileChanged" accept="image/jpg,image/jpeg,image/gif,image/png">
                                </div>
                                <input type="submit" id="submit-profile" value="Upload">
                            </form>

                            <form @submit.prevent="removePhoto">
                                <input type="submit" id="submit-profile" value="Remove">
                            </form>
                        </li>
                    </ul>
                </div>
                </div>
            </div>
            
        </div>
    </div>

  </div>
</template>

<script>
    import navBarModule from './NavBar.vue'
    import defaultThumbnail from "./assets/default_thumbnail.svg"

    export default {
        components: {
            navBarModule
        },

        data(){
            return {
                userImage: defaultThumbnail,
                userId: 0,
                name: "",
                email: "",
                city: "",
                country: "",
                cityCountry: "",

                changedName: "",
                changedEmail: "",
                changedCity: "",
                changedCountry: "",
                changedPhoto: null,

                newPassword: "",
                oldPassword: "",
                rootUrl: "http://localhost:4941/api/v1/users/"
            }
        },

        mounted: function() {
            this.userId = this.$cookies.get("seng365_cookie").userId;
            this.getUser();
        },

        methods: {
            getUser: function() {
                let url = this.rootUrl + this.userId;
                this.$http.get(url, {
                    headers: {'X-Authorization': this.$cookies.get("seng365_cookie").session}
                })
                .then((response) => {
                    this.name = response.data.name;
                    this.city = response.data.city ? response.data.city : "";
                    this.country = response.data.country ? response.data.country : "";
                    this.email = response.data.email;

                    this.changedName = this.name;
                    this.changedEmail = this.email;
                    this.changedCity = this.city;
                    this.changedCountry = this.country;

                    if(this.city && this.country)
                    {
                        this.cityCountry = this.city + ", " + this.country;
                    }
                    else if(this.city)
                    {
                        this.cityCountry = this.city;
                    }
                    else
                    {
                        this.cityCountry = this.country;
                    }

                    this.getAuthorPhotoUrl();
                })
                .catch((error) => {
                  alert(error.response.statusText);
                });
            },

            getAuthorPhotoUrl: function() {
                let url = this.rootUrl + this.userId + "/photo";
                this.$http.get(url)
                .then((response) => {
                    if(response.data)
                    {
                        this.userImage = url;
                    }
                    else
                    {
                        this.userImage = defaultThumbnail;
                    }
                })
                .catch((error) => {
                    this.userImage = defaultThumbnail;
                });
            },

            changeGeneralInfo: function() {
                if(this.changedName.length === 0)
                {
                    alert("Empty name!");
                    return;
                }

                if(this.changedEmail.length === 0)
                {
                    alert("Empty email address!");
                    return;
                }

                this.changedCity = this.changedCity.trim();
                let re =  /^[a-zA-Z]*$/;
                if(!re.test(this.changedCity))
                {
                    alert("Wrong city format!");
                    return;
                }
                else
                {
                    if(this.city.length != 0)
                    {
                        if(this.changedCity.length === 0)
                        {
                            alert("City can not be removed!");
                            return;
                        }
                    }
                }

                if(!re.test(this.changedCountry))
                {
                    alert("Wrong country format!");
                    return;
                }
                else
                {
                    if(this.country.length != 0)
                    {
                        if(this.changedCountry.length === 0)
                        {
                            alert("Country can not be removed!");
                            return;
                        }
                    }
                }

                let postBody = {};
                postBody["name"] = this.changedName;
                postBody["email"] = this.changedEmail;
                if(this.changedCity.length > 0)
                {
                    postBody["city"] = this.changedCity;
                }
                
                if(this.changedCountry.length > 0)
                {
                    postBody["country"] = this.changedCountry;
                }


                this.$http.patch(this.rootUrl + this.userId, postBody, {
                    headers: {'X-Authorization': this.$cookies.get("seng365_cookie").session}
                })
                .then((response) => {
                    alert("Profile information has been updated!");
                    window.location.reload();
                })
                .catch((error) => {
                    alert(error.response.statusText);
                });
            },

            changePassword: function() {
                if(this.newPassword.length === 0)
                {
                    alert("New password is empty!");
                    return;
                }

                if(this.oldPassword.length === 0)
                {
                    alert("Old password is empty!");
                    return;
                }

                if(this.oldPassword === this.newPassword)
                {
                    alert("The new password is as same as the old password!");
                    return;
                }

                let postBody = {};
                postBody["currentPassword"] = this.oldPassword;
                postBody["password"] = this.newPassword;

                this.$http.patch(this.rootUrl + this.userId, postBody, {
                    headers: {'X-Authorization': this.$cookies.get("seng365_cookie").session}
                })
                .then((response) => {
                    alert("Password has been updated!");
                    window.location.reload();
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
                this.$http.put(this.rootUrl + this.userId + '/photo', this.changedPhoto, {
                    headers: {'X-Authorization': this.$cookies.get("seng365_cookie").session,
                               "Content-Type": contentType}
                })
                .then((response) => {
                    alert("Profile photo has been updated!");
                    window.location.reload();
                })
                .catch((error) => {
                    alert(error.response.statusText);
                });
            },

            removePhoto: function() {
                if(this.userImage == defaultThumbnail)
                {
                    return;
                }

                this.$http.delete(this.rootUrl + this.userId + '/photo', {
                    headers: {'X-Authorization': this.$cookies.get("seng365_cookie").session}
                })
                .then((response) => {
                    alert("Profile photo has been removed!");
                    window.location.reload();
                })
                .catch((error) => {
                    alert(error.response.statusText);
                });
            }
        }
    }
</script>

<style>
.top {
    margin-top:20px;
    height: 250px;
}

.profile-thumbnail {
    width: 128px;
    height: 128px;
    border-radius:64px;
    background-size: cover;
    margin-top:10px;
}

.profile-name {
    margin-top: 5px;
    font-weight: bold;
    font-size: x-large;
}

.profile-city-country {
    font-weight: bold;
    font-size: medium;
    color: #666666;
}

.profile-email {
    font-weight: bold;
    font-size: medium;
    color: #666666;
}

.bottom {
    margin-top: 10px;
    margin-left:35%;
    margin-right:35%;
}

#general-info-title {
    background-color: orange;
    height: 44px;
}

#profile-list-element {
    font-weight: bold;
    font-size: medium;
    color: #333333;
    height: 50px;
}

#down-arrow {
    margin-left: 10px;
}

#fname-profile {
    height:44px;
    margin-left:10px;
    width:300px;
}

#fname-profile-photo {
    margin: 0 auto;
}

.change-tip{
    margin-top:10px;
    font-weight: bold; 
}

#submit-profile {
    margin-top:20px;
    width:250px;
    height:44px;
    font-weight: bold; 
    background-color: #AA0000;
    color:white;
}
</style>
