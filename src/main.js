import Vue from 'vue'
import App from './App.vue'

import LoadMapScript from '@/components/here.maps.js'
Vue.use ( LoadMapScript )


Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
