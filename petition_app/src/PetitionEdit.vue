<template>
  <div id="petition-edit">
    <div>
        <navBarModule></navBarModule>
    </div>

    <div class="content-container">
        <form @submit.prevent="updatePetition()">

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
                <p class="pc-tip"> <span style="color:red;">*</span> Change current category:</p>
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
                <p class="pc-tip"> <span style="color:red;">*</span> Change current hero image:</p>
                <input type="file" id="fname-profile-photo" name="fileContent" class="pc-element" @change="onFileChanged" accept="image/jpg,image/jpeg,image/gif,image/png">
            </div><br><br><br>
    
            <div>
                <div class="pc-date">
                    <p class="pc-tip"> Change current closing date :</p>
                    <input type="datetime-local" id="date" class="pc-element-date" :min="this.minDate" v-model='closingDate'>
                </div>
            </div><br><br>

            <input type="submit" id="pc-submit" value="Update">

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
                minDate: "",
                petitionObj: null
            }
        },

        mounted: function(){
            this.getPetitionById(this.$route.params.petitionId);
            this.minDate = this.formatDate(new Date().toLocaleString());
        },

        methods: {
            updatePetition: function() {
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

                let postBody = {};
                postBody["title"] = this.title;
                postBody["description"] = this.description;
                postBody["categoryId"] = this.categoryId;

                if(this.closingDate.length > 0)
                {
                    postBody["closingDate"] = this.closingDate;
                }
                else
                {
                    if(this.petitionObj.closingDate)
                    {
                        alert("Closing date can not bet removed!");
                        return;
                    }
                }

                this.$http.patch("http://localhost:4941/api/v1/petitions/" + this.petitionObj.petitionId, postBody, {
                    headers: {'X-Authorization': this.$cookies.get("seng365_cookie").session}
                })
                .then((response) => {
                    if(this.heroImage)
                    {
                        this.updateHeroImage();
                    }
                    else
                    {
                        alert("Your petition has been updated");
                        this.$router.push({ path: "/petitions"});
                    }
                })
                .catch((error) => {
                    alert(error.response.status);
                    alert(error.response.statusText);
                });
            },

            updateHeroImage: function() {
                let petitionId = this.petitionObj.petitionId;
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
                    alert("Your petition has been updated");
                    this.$router.push({ path: "/petitions"});
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
                    for(let c of this.categoryObjs)
                    {
                        if(c.name === this.category)
                        {
                            this.categoryId = c.categoryId;
                        }
                    }
                })
                .catch((error) => {
                  alert(error.response.statusText);
                });
            },

            onFileChanged: function(event) {
                this.heroImage = event.target.files[0];
            },

            getPetitionById: function(id) {
                let url = "http://localhost:4941/api/v1/petitions/" + id;
                this.$http.get(url)
                .then((response) => {
                    this.petitionObj = response.data;

                    this.title = this.petitionObj.title;
                    this.description = this.petitionObj.description;
                    this.category = this.petitionObj.category;

                    this.getCategories();
                    if(this.petitionObj.closingDate)
                    {
                        let localTime = new Date(this.petitionObj.closingDate).toLocaleString();
                        this.closingDate = this.formatDate(localTime);
                    }
                })
                .catch((error) => {
                  alert(error.response.statusText);
                });
            },

            formatDate: function(dateString) {
                let year = dateString.slice(6, 10);
                let month = dateString.slice(3, 5);
                let day = dateString.slice(0, 2);
                let hour = dateString.slice(12, 14);
                let minute = dateString.slice(15, 17);
                return year + "-" + month + "-" + day + "T" + hour + ":" + minute;
            },
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
