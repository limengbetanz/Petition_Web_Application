<template>
  <div id="my-petitions">
    
    <div>
        <navBarModule></navBarModule>
    </div>

    <div id="top-container">
      <!-- Search box -->
      <div>
        <form class="form-inline" role="form" @submit.prevent="searchPetitions(searchString)">
          <div class="form-group">
            <label class="sr-only" for="name">name</label>
            <input type="text" class="form-control" v-model="searchString" placeholder="Search title...">
          </div>
          <button type="submit" class="btn btn-primary" id="search-btn">Search</button>
        </form>
      </div>

      <!-- Category Filter -->
      <div class="btn-group dropdown" id="filter">
        <button class="btn btn-info dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true">
           {{ selectedCategoryName }}
            <span class="caret"></span>
        </button>
        <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
          <li role="presentation" v-for="category in categoryObjs" style="cursor:pointer;pointer-events: auto;">
            <a role="menuitem" tabindex="-1" id="category-item" @click="filterCategories(category.categoryId, category.name)">{{ category.name }}</a>
          </li>
        </ul>
      </div>

      <!-- Sortby Filter -->
      <label id="sortByTitle">Sort By: </label>
    
      <div class="btn-group dropdown" id="sortByBtn">
        <button class="btn btn-success dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-expanded="true">
            {{ selectedSortByTypeValue }}
            <span class="caret"></span>
        </button>
        <ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu1">
          <li role="presentation" v-for="type in sortByTypes" style="cursor:pointer;pointer-events: auto;">
            <a role="menuitem" tabindex="-1" id="sort-item" @click="sortBy(type.key, type.value)">{{ type.value }}</a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Petition List -->
    <div class="my-petitions">
        <br /><br />
        <ul class="list-group" v-for="petition in shownPetitions">
            <li class="list-group-item" id="petition-item">
                <div @click="viewPetitionDetail(petition.petitionId)">
                    <img class="petition-thumbnail" :src="'http://localhost:4941/api/v1/petitions/' + petition.petitionId + '/photo'">
                </div>

                <div class="list-group-item-heading">
                    <span v-if="petition.activeShowMore">
                        <a class="petition-heading" @click="viewPetitionDetail(petition.petitionId)">
                            {{petition.title.slice(0, 30)}}
                        </a>
                        <a class="petition-readmore" @click="viewPetitionDetail(petition.petitionId)">
                            ...Read more
                        </a>
                    </span>
                    <span v-else>
                        <a class="petition-heading" @click="viewPetitionDetail(petition.petitionId)">
                            {{ petition.title }}
                        </a>
                    </span>
                </div>

                <p class="petition-info">
                Category: {{ petition.category }}
                </p>

                <p class="petition-info">
                Author: {{ petition.authorName }}
                </p>

                <p class="petition-info">
                Number of signatures: {{ petition.signatureCount }}
                </p>
            </li>
        </ul>
        </div>

    <!-- Pagination -->
    <div class="pagination">
      <ul class="pagination" v-if="pages && pages.length">
        <li :class="{'disabled': currentPage === 1}">
          <a @click="setPage(1)">First</a>
        </li>

        <li :class="{'disabled': currentPage === 1}">
          <a @click="setPage(currentPage - 1)">&laquo;</a>
        </li>

        <li v-for="page in pages" :class="{'active': page === currentPage}">
          <a @click="setPage(page)">{{ page }}</a>
        </li>

        <li :class="{'disabled': currentPage === pages.length}">
          <a @click="setPage(currentPage + 1)">&raquo;</a>
        </li>

        <li :class="{'disabled': currentPage === pages.length}">
          <a @click="setPage(pages[pages.length - 1])">Last</a>
        </li>
      </ul>
    </div>

  </div>
</template>

<script>
    import navBarModule from './NavBar.vue'

    export default {
        components: {
            navBarModule
        },

        data(){
            return {
                errorFlag: false,
                petitions: [],
                shownPetitions: [],

                sortByTypes: [{key: "SIGNATURES_DESC", value: "Number of signatures, most to least"},
                              {key: "SIGNATURES_ASC", value: "Number of signatures, least to most"},
                              {key: "ALPHABETICAL_ASC", value: "Alphabetically by title, A-Z"},
                              {key: "ALPHABETICAL_DESC", value: "Alphabetically by title, Z-A"}],
                selectedSortByTypeValue: "Number of signatures, most to least",
                selectedSortByTypeKey: "SIGNATURES_DESC",

                rootUrl:"http://localhost:4941/api/v1/petitions",
                pages: [],
                currentPage: 0,

                query: "",

                categoryObjs: [],
                selectedCategoryName: "All categories",
                selectedCategoryId: 0
            }
        },
        mounted: function(){
            this.getCategories();
            this.getPetitions(0, -1, this.query, this.selectedCategoryId, this.selectedSortByTypeKey);
        },
        methods: {
            getPetitions: function(startIndex, count, query, categoryId, sortBy) {
                let userId = parseInt(this.$cookies.get("seng365_cookie").userId);
                let url = `?startIndex=${startIndex}&sortBy=${sortBy}&authorId=${userId}`;

                if(query.length != 0)
                {
                  url += `&q=${query}`;
                }
                if(categoryId != 0)
                {
                  url += `&categoryId=${categoryId}`;
                }
                if(count != -1)
                {
                  url += `&count=${count}`;
                }

                this.$http.get(this.rootUrl + url)
                .then((response) => {
                    this.petitions = response.data;
                    for(let p of this.petitions)
                    {
                        p.activeShowMore = p.title.length > 30;
                    }

                    this.shownPetitions = [];
                    this.pages = [];
                    this.currentPage = 0;

                    this.getCategories();

                    for(let i = 0; i < Math.ceil(this.petitions.length / 10.0); ++i)
                    {
                      this.pages.push(i + 1);
                    }
  
                    if(this.pages.length > 0)
                    {
                      this.setPage(1);
                    }
                })
                .catch((error) => {
                  alert(error.response.statusText);
                });
            },

            setPage: function(page) {
              if(page != this.currentPage && page != 0 && page != this.pages[this.pages.length - 1] + 1)
              {
                if(page * 10 > this.petitions.length)
                {
                  let remainder = this.petitions.length % 10;
                  this.shownPetitions = this.petitions.slice(10 * (page - 1), 10 * (page - 1) + remainder);
                }
                else
                {
                  this.shownPetitions = this.petitions.slice(10 * (page - 1), 10 * (page - 1) + 10);
                }
                this.currentPage = page;
              }
            },

            searchPetitions: function(query) {
              this.query = query === undefined ? "" : query;
              this.getPetitions(0, -1, this.query, this.selectedCategoryId, this.selectedSortByTypeKey);
            },

            getCategories: function() {
                let url = "/categories";
                this.$http.get(this.rootUrl + url)
                .then((response) => {
                    this.categoryObjs = [{categoryId: 0, name: "All categories"}];
                    this.categoryObjs = this.categoryObjs.concat(response.data);
                })
                .catch((error) => {
                  alert(error.response.statusText);
                });
            },

            filterCategories: function(id, name) {
                if(this.selectedCategoryId !== id)
                {
                    this.selectedCategoryName = name;
                    this.selectedCategoryId = id;
                    this.getPetitions(0, -1, this.query, this.selectedCategoryId, this.selectedSortByTypeKey);
                }
            },

            sortBy: function(key, value) {
              if(this.selectedSortByTypeKey != key)
              {
                this.selectedSortByTypeKey = key;
                this.selectedSortByTypeValue = value;
                this.getPetitions(0, -1, this.query, this.selectedCategoryId, this.selectedSortByTypeKey);
              }
            },

            viewPetitionDetail: function(id, image) {
              this.$router.push({ path: `/petitions/${id}`, params: {petitionId: id}});
            }
        }
    }
</script>

<style>
div.pagination {
  display: flex;
  justify-content: center;
}

.my-petitions {
    margin-left:20%;
    margin-right:20%;
}

#petition-item {
    height: 200px;
}

.petition-thumbnail {
    float:left;
    height:180px;
    width:320px;
    overflow: auto;
}

.petition-heading {
    font-size: x-large;
    font-weight: bold;
    color: green;
    cursor:pointer;
    pointer-events: auto;
}

.petition-readmore {
    font-size: medium;
    color: gray;
    cursor:pointer;
    pointer-events: auto;
}

.petition-info {
    font-size: medium;
    font-weight: bold;
    margin-top: 20px;
}

#top-container {
    margin-top:20px;
    display: flex;
    justify-content: center;
}

#filter {
  margin-left: 20px;
}

#sortByBtn {
  margin-left: 0px;
}

#dropdownMenu1{
    font-weight: bold;
}

#search-btn {
    font-weight: bold;
}

#category-item {
    font-weight: bold;
}

#sort-item {
    font-weight: bold;
}

#sortByTitle {
  margin-left: 20px;
  margin-right: 5px;
  margin-top: 14px;
  justify-content: center;
}

</style>