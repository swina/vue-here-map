<template>
  <div id="app">
    <div>
      <!--
      <button v-if="mode==='default'" @click="mode='draw'">Draw Mode</button>
      <button v-if="mode==='draw'" @click="mode='default'">Default</button>
      <here-map v-if="mode==='default'"
        address = "5th Ave,New York,USA"
        colors = "green,red"
        infoBox = "true"
        ui = "true"
        interactive = "true"
        drawFillColor = "rgba(0, 85, 170, 0.4)"
        drawStrokeColor = "#222"
        box = "bottom left"
        bubble="I love NY"
        drawInfo="Just 4 blocks"
        draw = "polygon"
        drawCoords = "40.78058114545861, -73.97639700748489, 0, 40.77944636543342, -73.97368562570269, 0, 40.7779260643931, -73.97477581523385, 0, 40.776253697280104, -73.9759915084864, 0, 40.77746926486235, -73.97888535038393, 0"/>
      -->
      <here-map
        address="5th Ave,New York,USA" 
        colors="green,red"
        :infoBox="true" 
        :ui="true"
        :interactive="true"
        mode="draw"
        drawFillColor="rgba(0, 85, 170, 0.4)"
        drawStrokeColor="#222"
        :overlay="true"
        overlaySrc="https://source.unsplash.com/random/800x600?transparent"
        box="bottom left"
        @options="help=!help">
        <div slot="infoBox">
          <p><small>Click on the map to set drawing coords/points</small></p>
        </div>
      </here-map>
    </div>
  </div>
</template>

<script>
import HereMap from '@/components/HereMaps.vue'
export default {
  name: 'App',
  components:{
    HereMap
  },
  data:()=>({
    help: false,
    mode: 'default'
  })
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

.main {
  position:fixed;
  background:#fff;
  border:1px solid #eaeaea;
  z-index:2000000;
  text-align:left;
  padding:1rem;
  font-size:.7rem;
  transition: 1s all linear;
  width:50%;
}

.main > ul > li { margin-bottom:1rem; }

button  {
  background: #7ea1d0;
  color: #fff;
  border:1px solid #333;
  cursor:pointer;
  border-radius:.2rem;
}
</style>
