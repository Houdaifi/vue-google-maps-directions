import Vue from 'vue'
import App from './App.vue'
import './assets/tailwind.css'
import * as VueGoogleMaps from "vue2-google-maps";
import excel from 'vue-excel-export'
 
Vue.config.productionTip = false

Vue.use(VueGoogleMaps, {
  load: {
    key: "AIzaSyBpUQXRK7mnSGBhFXO0wy6B0Pz8YPIhaIE",
    libraries: "places",
  },
});

Vue.use(excel);

new Vue({
  render: h => h(App),
}).$mount('#app')
