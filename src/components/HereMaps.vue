<template>
  <div class="here-map-container">
    <div id="map" ref="map" :style="'height:' + height + ';border:2px solid black;'"></div>
    <div v-if="$attrs.infoBox && !loading" :class="infoClass">
      <slot name="infoBox"></slot>
    </div>
    <div class="here-map-loading" v-if="loading">Loading map ...</div>
     <svg v-if="options" width="16" height="16" viewBox="0 0 16 16" title="Options" style="cursor:pointer;position:absolute;top:2;right:2;z-index:19999" @click="displayOptions=!displayOptions">
        <path class="path1" d="M8 0c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zM1.5 8c0-3.59 2.91-6.5 6.5-6.5 1.712 0 3.269 0.662 4.43 1.744l-6.43 2.756-2.756 6.43c-1.082-1.161-1.744-2.718-1.744-4.43zM9.143 9.143l-4.001 1.715 1.715-4.001 2.286 2.286zM8 14.5c-1.712 0-3.269-0.662-4.43-1.744l6.43-2.756 2.756-6.43c1.082 1.161 1.744 2.718 1.744 4.43 0 3.59-2.91 6.5-6.5 6.5z"></path>
      </svg>
    <div class="here-map-loading" v-if="options" title="Info" >
     
      <div v-if="displayOptions" style="padding:.2rem;">
        <small v-if="options.traffic"><p>{{options.traffic}}</p></small>
        <small v-if="options.routing">
          <p>{{options.routing.title}}</p>
          <p :style="'color:' + this.colors[0]">{{options.routing.from}}</p>
          <p :style="'color:' + this.colors[1]">{{options.routing.to}}</p>
        </small>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  name: 'HereMaps',
  data() {
    return {
      loading: true,
      displayOptions: false,
      platform: null,
      interactive: false,
      ui: null,
      center: null,
      destination: null,
      map: null,
      tags: ['Start,End'],
      colors: ['green', 'red' ]
    }
  },
  computed:{
    zoom(){
      return this.$attrs.zoom ? this.$attrs.zoom : 16
    },
    width(){
      return this.$attrs.width ? this.$attrs.width : parseInt(screen.width) + 'px'
    },
    height(){
      return this.$attrs.height ? this.$attrs.height : '610px'
    },
    infoClass(){
      return this.$attrs.box ? 'infoBox ' + this.$attrs.box : 'infoBox bottom-left'
    },
    options(){
      let opts = {}
      this.$attrs.traffic ? opts.traffic = 'Traffic: ON'  : null  
      this.$attrs.destination ? opts.routing = { title: 'Routing' , from: this.$attrs.address , to: this.$attrs.destination }  : null
      return opts
    }
  },
  watch:{
    center(coords){
      if ( coords.lat && coords.lng ) {
        this.createMap(coords)
        if ( this.$attrs.destination ){
          this.findAddress ( this.$attrs.destination , 'destination' )
        }
      }
    },
    destination(coords){
      if ( coords.lat && coords.lng ){
        this.createRouting(coords)
      }
    },
  },
  methods: {
    createMap(coords){
      let defaultLayers = this.platform.createDefaultLayers();
      let map = new H.Map ( this.$refs.map ,
        defaultLayers.vector.normal.map,
        {
          zoom: this.zoom,
          center: coords,
          width: this.width,
          height: this.height
        }
      )

      this.$attrs.traffic ? map.addLayer(defaultLayers.vector.normal.traffic) : null
      var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map))
      
      if ( typeof ( this.$attrs.ui ) === 'undefined' || this.$attrs.ui ){
        var ui = H.ui.UI.createDefault(map, defaultLayers,window.navigator.userLanguage || window.navigator.language)
        this.ui = ui
      }

      if ( !this.$attrs.destination ){
        if ( this.$attrs.bubble ){
          this.setBubble ( coords , ui )
        } 
        var icon = new H.map.Icon( this.markerIcon(0) )
        var marker = new H.map.Marker( coords, {icon: icon})
        map.addObject ( marker )
      }
      this.loading = false
      this.map = map
      this.setInteractive(map)
    },

    createRouting(coords){
      if ( !coords.lat && !coords.lng ) { return }
      let vm = this
      let destination = [ coords.lat , coords.lng ]
      let start = [ this.center.lat , this.center.lng ]
      let routingParameters = {
        'routingMode': 'fast',
        'transportMode': 'car',
        // The start point of the route:
        'origin': start.join(','),
        // The end point of the route:
        'destination': destination.join(','),
        // Include the route shape in the response
        'return': 'polyline'
      }
      var iconStart = new H.map.Icon(vm.markerIcon(0))
      var iconEnd = new H.map.Icon(vm.markerIcon(1))
      var onResult = function(result) {
        // ensure that at least one route was found
        if (result.routes.length) {
          result.routes[0].sections.forEach((section) => {
            // Create a linestring to use as a point source for the route line
            let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

            // Create a polyline to display the route:
            let routeLine = new H.map.Polyline(linestring, {
              style: { strokeColor: '#39d73e', lineWidth: 5 }
            });

            // Create a marker for the start point:
            let startMarker = new H.map.Marker(section.departure.place.location, {icon : iconStart });

            // Create a marker for the end point:
            let endMarker = new H.map.Marker(section.arrival.place.location, { icon: iconEnd });

            // Add the route polyline and the two markers to the map:
            //vm.map.addObjects([routeLine, startMarker, endMarker]);
            vm.map.addObjects([routeLine, startMarker , endMarker]);
            // Set the map's viewport to make the whole route visible:
            vm.map.getViewModel().setLookAtData({bounds: routeLine.getBoundingBox()});
          });
        }
      };
      let router = vm.platform.getRoutingService(null, 8)

    
      router.calculateRoute(routingParameters, onResult, function(error) {
        alert(error.message);
      })
    },
    
    findAddress(address,scope){
      let vm = this
      let service = this.platform.getSearchService()
      service.geocode ( {
        q: address
      }, (result) => {
        if ( scope === 'origin' ){
          vm.center = result.items[0].position 
        } else {
          vm.destination = result.items[0].position
          vm.createRouting(vm.destination)
        }
        return 
      })
    },
    geoCode(){
      let vm = this
      async function originGeoLocation( address , scope ){
         await vm.findAddress ( address,scope )
      }
      if ( this.$attrs.origin ){
        this.center = { lat : this.$attrs.origin.split(',')[0] , lng: this.$attrs.origin.split(',')[1] }
      }
      if ( this.$attrs.endpoint ){
        this.destination = { lat : this.$attrs.endpoint.split(',')[0] , lng: this.$attrs.endpoint.split(',')[1] }
      }
      if ( this.$attrs.address ){
        originGeoLocation( this.$attrs.address , 'origin' )
      }
    },

    markerIcon(pos){      
      return '<svg class="squish" width="24" height="52px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 72" fill="' + this.colors[pos] + '"><path d="M24,0 C11.406,0 0,10.209 0,22.806 C0,35.4 10.407,50.436 24,72 C37.593,50.436 48,35.4 48,22.806 C48,10.209 36.597,0 24,0 L24,0 Z M24,33 C19.029,33 15,28.971 15,24 C15,19.029 19.029,15 24,15 C28.971,15 33,19.029 33,24 C33,28.971 28.971,33 24,33 L24,33 Z"></path></svg>'
    },

    setBubble( coords , ui ){
      let myBubble = new H.ui.InfoBubble( coords , {
          content: this.tags[0]
      })
      // Add info bubble to the UI:
      ui.addBubble(myBubble);
    },
    setInteractive(map){
      // get the vector provider from the base layer
      var provider = map.getBaseLayer().getProvider();

      // get the style object for the base layer
      var style = provider.getStyle();

      var changeListener = (evt) => {
        if (style.getState() === H.map.Style.State.READY) {
          style.removeEventListener('change', changeListener);

          // enable interactions for the desired map features
          style.setInteractive(['places', 'places.populated-places'], true);

          // add an event listener that is responsible for catching the
          // 'tap' event on the feature and showing the infobubble
          provider.addEventListener('tap', this.onTap);
        }
      }
      style.addEventListener('change', changeListener);
      
    },
    onTap(evt) {
      // calculate infobubble position from the cursor screen coordinates
      let position = this.map.screenToGeo(
        evt.currentPointer.viewportX,
        evt.currentPointer.viewportY
      );
      // read the properties associated with the map feature that triggered the event
      let props = evt.target.getData().properties;
      // create a content for the infobubble
      if ( props.population ){
        let content = '<div style="width:250px">' +
          (props.population ? 'Population: ' + props.population : '') +
          ( props.country_capital ? '<br />Country Capital' : '' ) + '</div>';

        // Create a bubble, if not created yet
        let bubble = this.interactive
        if (!bubble) {
          bubble = new H.ui.InfoBubble(position, {
            content: content
          });
          this.ui.addBubble(bubble);
        } else {
          // Reuse existing bubble object
          bubble.setPosition(position);
          bubble.setContent(content);
          bubble.open();
        }
      }
    },
    async init(){
      this.platform = await new H.service.Platform({
        'apikey': process.env.VUE_APP_HERE_APIKEY
      })
      this.$attrs.tags ? this.tags = this.$attrs.tags.split(',') : null
      this.geoCode()
    }

  },
  mounted(){
    this.$loadMapScript()
    .then((resp) => {
      this.init()
    })
    .catch(() => {
      console.log ( 'Map Scripts not loaded')
    })
    if ( this.$attrs.colors && this.$attrs.colors.split(',').length === 2 ){
      this.colors = this.$attrs.colors.split(',')
    }
  }
}
</script>

<style scoped>
.here-map-container {
  position:relative;

}

.here-map-loading {
  position:absolute;
  top:2px;
  right:2px;
  width:10rem;
  opacity:.7;
  background:#fefefe;
  cursor:pointer;
  transition: 1s all;
}

.here-map-loading > div > small > p {
  text-align:left;
  padding:0rem;
  margin:0rem;
}

.infoBox {
  position:absolute;
  padding:.2rem;
  bottom:0;
  left:0;
  background: #f2f2f2;
  border:2px solid #444;
  z-index:100000;
}

.top {
  bottom:unset;
  top:0;
}

.bottom {
  top:unset;
  bottom:0;
}

.left {
  right: unset;
  left:0;
}

.right {
  left:unset;
  right:0;
}

.squish.svg {
		animation: squish 1s ease-in-out infinite alternate;
}  
	
  @keyframes squish {
    from {
      transform: translate3d(0,0,0);
    }
    to {
      transform: translate3d(0,-11px,0) scale(1.3) rotateY(50deg);
    }
  }

</style>