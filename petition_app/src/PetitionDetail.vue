<template>
  <div id="petition_detail">
    
    <div>
        <navBarModule></navBarModule>
    </div>

    <div>
        <h1 class="petition-title" > {{ petitionObj.title}} </h1>
    </div>

    <!-- Petition Detail -->
    <div class="petition">
        <div class="left">
            <div>
                <img :src="rootUrl + petitionId + '/photo'" id="heroImage" alt="hero image">
            </div>

            <div class="description">
                {{ petitionObj.description }}
            </div>
        </div>

        <div class="right">
            <div class="top-divider"></div>

            <div>
                <div class="petition-info-left">Number of Signatures:</div>
                <div class="petition-info-right">{{ petitionObj.signatureCount }}</div>
            </div>

            <div>
                <div class="petition-info-left">Category:</div>
                <div class="petition-info-right">{{ petitionObj.category }}</div>
            </div>

            <div>
                <div class="petition-info-left">Open Date:</div>
                <div class="petition-info-right">{{ petitionObj.createdDate }}</div>
            </div>

            <div>
                <div class="petition-info-left">Closing Date:</div>
                <div class="petition-info-right">{{ petitionObj.closingDate }}</div>
            </div>

            <div>
                <div class="petition-info-left">Status:</div>
                <div class="petition-info-right">{{ petitionObj.status }}</div>
            </div>

            <div v-if="isMyPetition">
                <button type="button"  id="del-btn" class="btn btn-danger" data-toggle="modal" data-target="#deleteUserModal">
                    Delete
                </button>
                <div class="modal fade" id="deleteUserModal" tabindex="-1" role="dialog" aria-labeledby="deleteUserModalLable" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">

                            <div class="modal-header">
                                <h5 class="modal-title" id="deleteUserModalLabel">Delete Petition</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidder="true">&times;</span>
                                </button>
                            </div>

                            <div class="modal-body">
                            ​   Are​ you sure that you want to ​delete​ ​this​ petition? 
                            </div>

                            <div class="modal-footer">
                                <button type="button" class="btn btn-danger" data-dismiss="modal" v-on:click="deletePetition(petitionObj.petitionId)">
                                    ​Delete​
                                </button>
                                
                                <button type="button" class="btn btn-info" data-dismiss="modal">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


                <div v-if="petitionObj.status == 'Closed'">
                    <button type="button" id="edit-btn" class="btn btn-primary disabled">Edit</button>
                </div>
                <div v-else>
                    <button type="button" id="edit-btn" class="btn btn-primary active" @click="editPetition()">Edit</button>
                </div>
            </div>

            <div v-else>
                <div v-if="canSign">
                    <button type="button" id="edit-btn" class="btn btn-primary" @click="signPetitionEventCallback()">{{ signText }}</button>
                </div>
                <div v-else>
                    <button type="button" id="edit-btn" class="btn btn-primary disabled">{{ signText }}</button>
                </div>
            </div>
    
            <div class="bottom-divider"></div>

            <div class="author-info">
                <div>
                    <img class="author-thumbnail" alt="author thumbnail" :src="userImage">
                </div>

                <div class="author-detail" v-if="userObj.city" >
                    {{ userObj.name }} from {{ userObj.city }}, {{ userObj.country }} started this petition on {{ petitionObj.createdDate }}
                </div>
                <div class="author-detail" v-else>
                   {{ userObj.name }} started this petition on {{ petitionObj.createdDate }}
                </div>
            </div>

            <div class="share">
            
                <ShareNetwork 
                network="facebook" 
                :url=shareUrl
                :title=shareTitle
                :description=shareDescription
                :quote=shareQuote
                :hashtags=shareHashtags>
                    <div class="facebook">
                        <img class="facebook" :src="facebookIcon">
                    </div>
                </ShareNetwork>

                <ShareNetwork 
                network="twitter" 
                :url=shareUrl
                :title=shareTitle
                :description=shareDescription
                :quote=shareQuote
                :hashtags=shareHashtags>
                    <div class="twitter">
                        <img class="twitter" :src="twitterIcon">
                    </div>
                </ShareNetwork>
                
                <ShareNetwork 
                network="email" 
                :url=shareUrl
                :title=shareTitle
                :description=shareDescription
                :quote=shareQuote
                :hashtags=shareHashtags>
                    <div class="email">
                        <img class="email" :src="emailIcon">
                    </div>
                </ShareNetwork>
            </div>

 
            <div class="signatories-container" id="accordion">
                <div class="panel panel-default">
                    <div class="panel-heading" id="signatories-banner">
                        <h4 class="panel-title">
                            <a data-toggle="collapse" data-parent="#accordion" href="#collapseOne" style="font-weight: bold;">
                                Show All Signatories
                            </a>
                        </h4>
                    </div>

                    <div id="collapseOne" class="panel-collapse collapse">
                        <div id="signatories" class="signatories-list">
                            <ul class="list-group" v-for="signatory in signatories">
                                <li class="list-group-item" id="signatories-list-element">
                                    <img id="signatoryThumbnail" class="img-circle" alt="signatory thumbnail" :src="signatory.thumbnail">
                                    <p>{{ signatory.name }} </p>
                                    <p v-if="signatory.city">{{ signatory.city }}, {{ signatory.country }}</p>
                                    <p>Signed on: {{ signatory.signedDate }}</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
    import defaultAuthorThumbnail from "./assets/default_thumbnail.svg"
    import facebookLogo from "./assets/facebook_logo.png"
    import twitterLogo from "./assets/twitter_logo.png"
    import emailLogo from "./assets/email_logo.jpg"

    import navBarModule from './NavBar.vue'

    export default {
        components: {
            navBarModule
        },

        data(){
            return {
                errorFlag: false,
                petitionId: 0,
                petitionObj: null,
                userObj: null,
                userImage: null,
                defualtImage: null,
                rootUrl: "http://localhost:4941/api/v1/petitions/",
                rootUrlUser: "http://localhost:4941/api/v1/users/",
                signatories: [],
                isMyPetition: false,
                canSign: true,
                signText: "Sign",

                facebookIcon: null,
                twitterIcon: null,
                emailIcon: null,
                shareUrl: null,
                shareTitle: null,
                shareDescription: null,
                shareHashtags: null,
                shareQuote: null
            }
        },
        mounted: function(){
            this.defualtImage = defaultAuthorThumbnail;
            this.facebookIcon = facebookLogo;
            this.twitterIcon = twitterLogo;
            this.emailIcon = emailLogo;
            this.shareUrl = "https://canterbury.ac.nz/petitions/" + this.$route.params.petitionId;
            this.getPetitionById(this.$route.params.petitionId);
            this.getSignatories(this.$route.params.petitionId);
        },

        methods: {
            getPetitionById: function(id) {
                this.petitionId = id;

                let url = `${id}`;
                this.$http.get(this.rootUrl + url)
                .then((response) => {
                    this.petitionObj = response.data;
                    this.petitionObj.createdDate = this.formatDate(this.petitionObj.createdDate);

                    
                    if(this.petitionObj.closingDate)
                    {
                        if(new Date(this.petitionObj.closingDate).getTime() < Date.now())
                        {
                            this.petitionObj.status = "Closed";
                        }
                        else
                        {
                            this.petitionObj.status = "Open";
                        }
                        this.petitionObj.closingDate = this.formatDate(this.petitionObj.closingDate);
                    }
                    else
                    {
                        this.petitionObj.closingDate = "2099-12-31 23:59:59"
                        this.petitionObj.status = "Open";
                    }

                    if(this.$cookies.get("seng365_cookie"))
                    {
                        let authorId =  this.$cookies.get("seng365_cookie").userId;
                        this.isMyPetition = this.petitionObj.authorId === authorId;
                    }
                    else
                    {
                        this.isMyPetition = false;
                    }

                    this.shareDescription = this.petitionObj.description;
                    this.shareHashtags = this.petitionObj.category;
                    this.shareTitle = this.petitionObj.title;
                    this.shareQuote = "Hey, check out this petition!";
                    
                    this.getAuthor(this.petitionObj.authorId);
                })
                .catch((error) => {
                  alert(error.response.statusText);
                });
            },

            getAuthor: function(id) {
                let url = this.rootUrlUser + id;
                this.$http.get(url)
                .then((response) => {
                    this.userObj = response.data;
                    this.getAuthorPhotoUrl(id);
                })
                .catch((error) => {
                  alert(error.response.statusText);
                });
            },

            getAuthorPhotoUrl: function(id) {
                let url = this.rootUrlUser + id + "/photo";
                this.$http.get(url)
                .then((response) => {
                    if(response.data)
                    {
                        this.userImage = url;
                    }
                    else
                    {
                        this.userImage = defaultAuthorThumbnail;
                    }
                })
                .catch((error) => {
                  this.userImage = defaultAuthorThumbnail;
                });
            },

            getSignatories: function(id) {
                this.signatories = [];
                let url = this.rootUrl + id + "/signatures";
                this.$http.get(url)
                .then((response) => {
                    if(response.data)
                    {
                        for(let signature of response.data)
                        {
                            let signatory = {};
                            signatory.name = signature.name;
                            signatory.city = signature.city;
                            signatory.country = signature.country;
                            signatory.signedDate = this.formatDate(signature.signedDate);
                            signatory.signatoryId = signature.signatoryId;
                            signatory.thumbnail = defaultAuthorThumbnail;
                            this.signatories.push(signatory);
                        }
                        
                        if(this.$cookies.get("seng365_cookie"))
                        {
                            if(this.petitionObj.status === "Closed")
                            {
                                this.canSign = false;
                            }
                            else
                            {
                                this.canSign = true;
                                this.signText = "Sign";
                                let currentUserId = this.$cookies.get("seng365_cookie").userId;
                                for(let signature of response.data)
                                {
                                    if(signature.signatoryId === currentUserId) 
                                    {
                                        this.signText = "Unsign";
                                        break;
                                    }
                                }
                            }
                        }
                        else
                        {
                            this.canSign = false;
                        }
                        

                        for(let signatory of this.signatories)
                        {
                            this.getSignatoryPhotoUrl(signatory.signatoryId);
                        }
                    }
                })
                .catch((error) => {
                  alert(error.response.statusText);
                });
            },

            getSignatoryPhotoUrl: function(id) {
                let url = this.rootUrlUser + id + "/photo";
                this.$http.get(url)
                .then((response) => {
                    for(let signatory of this.signatories)
                    {
                        if(signatory.signatoryId == id)
                        {
                            if(response.data)
                            {
                                signatory.thumbnail = this.rootUrlUser + id + "/photo";
                            }
                            else
                            {
                                signatory.thumbnail = defaultAuthorThumbnail;
                            }
                        }
                    }
                })
                .catch((error) => {
                    for(let signatory of this.signatories)
                    {
                        if(signatory.signatoryId == id)
                        {
                            signatory.thumbnail = defaultAuthorThumbnail;
                        }
                    }
                });
            },

            formatDate: function(dateString) {
                let current_datetime = new Date(dateString);
                let formatted_date = current_datetime.getFullYear() + "-";

                if(current_datetime.getMonth() + 1 < 10)
                {
                    formatted_date += "0" + (current_datetime.getMonth() + 1);
                }
                else
                {
                    formatted_date += (current_datetime.getMonth() + 1);
                }
    
                formatted_date += "-";

                if(current_datetime.getDate() < 10)
                {
                    formatted_date += "0" + current_datetime.getDate();
                }
                else
                {
                    formatted_date += current_datetime.getDate();
                }
                
                formatted_date += " ";

                if(current_datetime.getHours() < 10)
                {
                    formatted_date += "0" + current_datetime.getHours();
                }
                else
                {
                    formatted_date += current_datetime.getHours();
                }

                formatted_date += ":";

                if(current_datetime.getMinutes() < 10)
                {
                    formatted_date += "0" + current_datetime.getMinutes();
                }
                else
                {
                    formatted_date += current_datetime.getMinutes();
                }

                formatted_date += ":";

                if(current_datetime.getSeconds() < 10)
                {
                    formatted_date += "0" + current_datetime.getSeconds();
                }
                else
                {
                    formatted_date += current_datetime.getSeconds();
                }
                return formatted_date;
            },

            editPetition: function(id) {
                this.$router.push({ path: `/petition/edit/${this.petitionObj.petitionId}`});
            },

            deletePetition: function(id) {
                this.$http.delete(this.rootUrl + id, {
                    headers: {'X-Authorization': this.$cookies.get("seng365_cookie").session}
                })
                .then((response) => {
                    alert("The chosen petition has been deleted!");
                    this.$router.push({ path: "/petitions"});
                })
                .catch((error) => {
                    alert(error.response.statusText);
                });
            },

            signPetitionEventCallback: function() {
                if(this.signText === "Sign")
                {
                    this.$http.post(this.rootUrl + this.petitionObj.petitionId + "/signatures", "", {
                        headers: {'X-Authorization': this.$cookies.get("seng365_cookie").session}
                    })
                    .then((response) => {
                        alert("You have signed this petition!");
                        this.getSignatories(this.petitionObj.petitionId);
                    })
                    .catch((error) => {
                        alert(error.response.statusText);
                    });
                }
                else
                {
                    this.$http.delete(this.rootUrl + this.petitionObj.petitionId + "/signatures", {
                        headers: {'X-Authorization': this.$cookies.get("seng365_cookie").session}
                    })
                    .then((response) => {
                        alert("You have unsigned this petition!");
                        this.getSignatories(this.petitionObj.petitionId);
                    })
                    .catch((error) => {
                        alert(error.response.statusText);
                    });
                }
            }
        }
    }
</script>

<style>
.petition-title {
    font-weight: bold;
}

.petition {
    margin-left: 10px;
    margin-right: 10px;
}

.petition .left {
    width: 70%;
    float: left;
}

.description {
    margin-left: 15%;
    margin-right: 15%;
    margin-top: 20px;
    font-size: larger;
    word-break:break-all;
    text-align: left;
    font-weight: bold;
}

.author-info {
    margin-left: 5px;
    margin-right: 5px;
    width: 100%;
    height: auto;
}

.author-thumbnail {
    display: inline;
    margin-top: 15px;
    width: 64px;
    height: 64px;
    border-radius:32px;
    background-size: cover;
}

.author-detail {
    display: inline;
    text-align: left;
    font-weight: bold;
}

.share {
    margin-top: 25px;
}

.facebook {
    display: inline-block;
    width: 48px;
    height: 48px;
    padding: 5px;
}

.twitter {
    display: inline-block;
    width: 48px;
    height: 48px;
    padding: 5px;
}

.email {
    display: inline-block;
    width: 48px;
    height: 48px;
    padding: 5px;
}

.petition .right {
    width: 30%;
    float: right;
}

.petition .right .top-divider {
    margin-right: 20px;
    height:6px;
    background-color: black;
}

.petition .right .bottom-divider {
    margin-right: 20px;
    margin-top: 222px;
    height:6px;
    background-color: black;
}

.petition .right .petition-info-left {
    width: 49%;
    float: left;
    text-align: left;
    font-weight: bold;
    font-size: larger;
    padding-bottom: 5px;
    margin-top: 5px;
    margin-left: 1%;
    border-top: 0px solid white;
    border-left: 0px solid white;
    border-right: 0px solid white;
    border-bottom: 1px solid black;
}

.petition .right .petition-info-right {
    width: 45%;
    float: right;
    margin-right:5%;
    text-align: left;
    font-size: larger;
    padding-bottom: 5px;
    margin-top: 5px;
    border-top: 0px solid white;
    border-left: 0px solid white;
    border-right: 0px solid white;
    border-bottom: 1px solid black;
}

.signatories-container {
    margin-top: 20px;
    margin-right: 30px;
    margin-left: 25px;
    height: 40px;
}

#signatories-banner {
    background-color: orange;
}

.signatories-list {
    margin-top: 20px;
    height: 500px;
    overflow:scroll;
    -webkit-overflow-scrolling: touch;
}

#signatories-list-element {
    height: 100px;
}

#heroImage {
    vertical-align: middle;
    width: auto;
    max-height: 400px;
    background-size: cover;
}

#signatoryThumbnail {
    width: 64px;
    height: 64px;
    float:left;
    background-size: cover;
    margin-top: 12px;
}

#signaturesNum {
 font-weight: bold;
 font-size: larger;
}

#edit-btn {
    width:80px;
    float: left;
    margin-left:20px;
    margin-top:10px;
    font-weight: bold;
}

#del-btn {
    margin-top:10px;
    margin-left:10px;
    width:80px;
    float: left;
    font-weight: bold;
}

</style>>
