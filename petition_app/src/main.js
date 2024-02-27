import Vue from 'vue'
import App from './App.vue'
import Home from './Home.vue'
import Petitions from './Petitions.vue'
import PetitionDetail from './PetitionDetail.vue'
import Profile from './Profile.vue'
import PetitionCreation from './PetitionCreation.vue'
import MyPetitions from './MyPetitions.vue'
import PetitionEdit from './PetitionEdit.vue'

import VueRouter from 'vue-router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import VueSocialSharing from 'vue-social-sharing'
import VueCookies from 'vue-cookies'

Vue.use(VueRouter);
Vue.use(VueAxios, axios);
Vue.use(VueSocialSharing);
Vue.use(VueCookies);

// set default config
Vue.$cookies.config('7d')

// set global cookie
Vue.$cookies.set('theme','default');
Vue.$cookies.set('hover-time','1s');

const routes = [
  {
    path: "/",
    component: Home
  },

  {
    path: "/petitions",
    component: Petitions
  },

  {
    path: "/petitions/:petitionId",
    component: PetitionDetail
  },

  {
    path: "/profile",
    component: Profile
  },

  {
    path: "/petition/creation",
    component: PetitionCreation
  },

  {
    path: "/myPetitions",
    component: MyPetitions
  },

  {
    path: "/petition/edit/:petitionId",
    component: PetitionEdit
  }
];

const router = new VueRouter({
  routes: routes,
  mode: 'history'
})

new Vue({
  el: '#app',
  router: router,
  render: h => h(App)
})
