<template>
  <div id="app">
    <here-map
      address="5th Ave,New York,USA" 
      destination="Park Ave.,New York,USA"
      colors="green,red"
      :infoBox="true" 
      :ui="true"
      box="bottom left">
      <div slot="infoBox">
        <p><small>This is a demo of vue-here-map</small></p>
      </div>
    </here-map>
  </div>
  <!--       address="Via Nazionale,Roma,Italy" 
      destination="Via Conca d'Oro,Roma,Italy" 
-->
</template>

<script>
import HereMap from '@/components/HereMaps.vue'
export default {
  name: 'App',
  components:{
    HereMap
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
