<template>
  <div id="petition-creation">
    <div>
        <navBarModule></navBarModule>
    </div>

    <div class="content-container">
        <form @submit.prevent="createPetition()">

            <div>
                <p class="pc-tip"> <span style="color:red;">*</span> Petition title:</p>
                <textarea class="pc-element" rows="1" name="title" v-model="title" style="display:block;">
                </textarea><br><br><br>
            </div>
            
            <div>
                <p class="pc-tip"> <span style="color:red;">*</span> Petition description:</p>
                <textarea class="pc-element" rows="10" name="description" v-model="description" style="display:block;">
                </textarea>
            </div><br><br><br><br><br><br><br><br><br><br><br><br><br>
            
            <div>
                <p class="pc-tip"> <span style="color:red;">*</span> Choose a category:</p>
                 <div class="btn-group dropdown" id="pc-category">
                    <button class="btn btn-info dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true" style="font-weight:bold">
                        {{ category }} <span class="caret"></span>
                    </button>

                    <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1" style="font-weight:bold">
                    <li role="presentation" style="cursor:pointer;pointer-events: auto;" v-for="category in categoryObjs">
                        <a role="menuitem" tabindex="-1" id="category-item" @click="selectCategory(category.name, category.categoryId)">{{ category.name }}</a>
                    </li>
                    </ul>
                </div>
            </div><br><br>

            <div>
                <p class="pc-tip"> <span style="color:red;">*</span> Choose a hero image:</p>
                <input type="file" id="fname-profile-photo" name="fileContent" class="pc-element" @change="onFileChanged" accept="image/jpg,image/jpeg,image/gif,image/png">
            </div><br><br><br>
    
            <div>
                <div class="pc-date">
                    <p class="pc-tip"> Choose a closing date :</p>
                    <input type="datetime-local" id="date" class="pc-element-date" :min="this.minDate" v-model='closingDate'>
                </div>
            </div><br><br>

            <input type="submit" id="pc-submit" value="Create">

        </form>

        
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
                title: "",
                description: "",
                category: "",
                categoryId: 0,
                categoryObjs: null,
                heroImage: null,
                closingDate: "",
                minDate: ""
            }
        },

        mounted: function(){
            this.getCategories();
            this.minDate = new Date().toISOString().slice(0, 16);
        },

        methods: {
            createPetition: function() {
                if(this.title.length === 0)
                {
                    alert("Empty petitoin title!");
                    return;
                }

                if(this.description.length === 0)
                {
                    alert("Empty petitoin description!");
                    return;
                }

                if(!this.heroImage)
                {
                    alert("Please upload a hero image!");
                    return;
                }
    
                let filename = this.heroImage.name;
                let extension = filename.split(".")
                if(extension.length < 2)
                {
                    alert("Wrong image filename!")
                }

                let contentType = "image/" + extension[extension.length - 1];
                if(contentType == "image/jpg")
                {
                    contentType = "image/jpeg";
                }

                let postBody = {};
                postBody["title"] = this.title;
                postBody["description"] = this.description;
                postBody["categoryId"] = this.categoryId;
    
                if(this.closingDate.length > 0)
                {
                    postBody["closingDate"] = this.closingDate;
                }

                this.$http.post("http://localhost:4941/api/v1/petitions/", postBody, {
                    headers: {'X-Authorization': this.$cookies.get("seng365_cookie").session}
                })
                .then((response) => {
                    this.uploadHeroImage(response.data.petitionId);
                })
                .catch((error) => {
                    alert(error.response.status);
                    alert(error.response.statusText);
                });
            },

            uploadHeroImage: function(petitionId) {
                let filename = this.heroImage.name;
                let extension = filename.split(".")
                if(extension.length < 2)
                {
                    alert("Wrong image filename!")
                }

                let contentType = "image/" + extension[extension.length - 1];
                if(contentType == "image/jpg")
                {
                    contentType = "image/jpeg";
                }

                this.$http.put("http://localhost:4941/api/v1/petitions/" + petitionId + '/photo', this.heroImage, {
                    headers: {'X-Authorization': this.$cookies.get("seng365_cookie").session,
                               "Content-Type": contentType}
                })
                .then((response) => {
                    this.signPetition(petitionId);
                })
                .catch((error) => {
                    alert(error.response.statusText);
                });
            },

            selectCategory: function(category, id) {
                this.category = category;
                this.categoryId = id;
            },

            getCategories: function() {
                let url = "http://localhost:4941/api/v1/petitions/categories";
                this.$http.get(url)
                .then((response) => {
                    this.categoryObjs = response.data;
                    if(this.categoryObjs.length > 0)
                    {
                        this.category = this.categoryObjs[0].name;
                        this.categoryId = this.categoryObjs[0].categoryId;
                    }
                })
                .catch((error) => {
                  alert(error.response.statusText);
                });
            },

            onFileChanged: function(event) {
                this.heroImage = event.target.files[0];
            },

            signPetition: function(petitionId) {
                let postBody = {};
                postBody["id"] = petitionId;

                this.$http.post("http://localhost:4941/api/v1/petitions/" + petitionId + '/signatures', postBody, {
                    headers: {'X-Authorization': this.$cookies.get("seng365_cookie").session}
                })
                .then((response) => {
                    alert("Your petition has been created");
                    this.$router.push({ path: "/petitions"});
                })
                .catch((error) => {
                    alert(error.response.statusText);
                });
            }
        }
    }
</script>

<style>
.content-container {
    margin-top: 20px;
    margin-left: 20%;
    margin-right: 20%;
}

.pc-tip {
    font-size: medium;
    font-weight: bold;
}

.pc-element {
   margin-left:10%;
   width:80%;
   float:left;
   font-size: medium;
   resize:none;
   overflow: auto;
   word-break: break-all;
   background-color: #EEEEEE;
}

.pc-element-date {
    width:25%;
    font-size: medium;
    font-weight: bold;
}

#pc-submit {
    width:250px;
    height:44px;
    font-weight: bold; 
    background-color: #AA0000;
    color:white;
}
</style>
