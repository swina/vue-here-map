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

    <div v-if="$attrs.mode && $attrs.mode === 'draw'" class="here-map-coords top left" title="click on the map to set the drawing points">
      <div style="margin-right:.2rem;"><small>Draw Mode</small></div>
      <svg style="margin-right:.2rem;" width="20" height="20" xmlns="http://www.w3.org/2000/svg" title="Draw Mode" @click="$emit('click')">
      <g>
         <path id="svg_1" d="m15.01919,3.33932l-1.73079,-1.08785c-0.43668,-0.2742 -1.01209,-0.14223 -1.28725,0.29455l-0.6822,1.08582l3.31108,2.07962l0.68274,-1.08532c0.27411,-0.4373 0.14329,-1.01323 -0.29358,-1.28682l0,0zm-9.59233,9.67354l3.31126,2.07959l5.39681,-8.59128l-3.31284,-2.08014l-5.39523,8.59182l0,0zm-0.50579,2.6422l-0.07313,1.95333l1.72814,-0.91407l1.60593,-0.84793l-3.19448,-2.00752l-0.06646,1.81619l0,0l0,0z" stroke-width="1.5" stroke="#000" fill="#fff"/>
      </g>
      </svg>
        <button @click="drawPolyline" v-if="startDraw && markers.length > 1">Draw Line</button>
        <button @click="drawPolygon" v-if="startDraw && coords.length > 6">Draw Polygon</button>
        <button @click="overlayPicture" v-if="startDraw && markers.length > 1">Overlay Image</button>
        <button @click="getObjectData" v-if="!startDraw">Data</button>
        <button @click="removeRenderedGroup" v-if="!startDraw">Clear</button>
    </div>

    <div class="here-map-data" :style="'opacity:' + heightData" v-if="showData && $attrs.mode && $attrs.mode === 'draw' && drawingPoints">
      
      <div style="width:100%;min-height:10rem;text-align:left;font-size:.8rem;">
        &lt;here-map <br/>
        <template v-for="(key,i) in Object.keys(exportData)">
          <span :key="'data-' + i" v-if="key!='mode'">
              {{key}} = "{{exportData[key]}}"<br/>
          </span>
        </template>
        draw = "{{drawingType}}"<br/>
        drawCoords = <span>"{{drawingPoints.join(',\n')}}"</span>/&gt;</p>
      </div>
      <button @click="showData=!showData"><small>Close</small></button>
    </div>
  </div>
</template>


<script>
export default {
  name: 'HereMap',
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
      startDraw: true,
      drawOptions:false,
      drawingMarkersGroup: null,
      renderedDrawingGroup: null,
      drawingType: null,
      drawingPoints: null,
      showData: false,
      heightData:0,
      markers: [],
      coords:[],
      overlayImg: [],
      tags: ['Start,End'],
      colors: ['green', 'red' ],
      exportData:null
    }
  },
  computed:{
    zoom(){
      return this.$attrs.zoom ? this.$attrs.zoom : 16
    },
    width(){
      return this.$attrs.width ? this.$attrs.width + 'px' : parseInt(screen.width) + 'px'
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
    showData(v){
      v ? this.heightData = '1' : this.heightData = '0'
    },
  },
  methods: {
    
    //initialize map with APIKEY set in env file
    async init(){
      this.platform = await new H.service.Platform({
        'apikey': process.env.VUE_APP_HERE_APIKEY
      })
      this.$attrs.tags ? this.tags = this.$attrs.tags.split(',') : null
      this.geoLocation()
    },
    
    //create map
    createMap(coords){
        let vm = this
        let defaultLayers = this.platform.createDefaultLayers();
        let map = new H.Map ( this.$refs.map ,
            defaultLayers.vector.normal.map,
            {
                zoom: this.zoom,
                center: coords,
                width: this.width,
                height: this.height,
                pixelRatio: window.devicePixelRatio || 1
            }
        )

        this.$attrs.traffic ? map.addLayer(defaultLayers.vector.normal.traffic) : null

        var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map))
        
        //Draw mode
        if ( typeof this.$attrs.mode != 'undefined' && this.$attrs.mode === 'draw'){

            let points = [] 
            vm.drawingMarkersGroup = new H.map.Group()
            map.addEventListener('tap', function(evt) {

            if ( vm.startDraw ){
                
                let coord = map.screenToGeo ( evt.currentPointer.viewportX , evt.currentPointer.viewportY )
                vm.markers.push ( {lat: coord.lat , lng: coord.lng }) 
                vm.coords.push ( coord.lat , coord.lng , 0 )
                let dIcon = new H.map.Icon( vm.drawIcon() )
                let drawMarker = new H.map.Marker( coord , {icon : dIcon });
                vm.drawingMarkersGroup.addObject(drawMarker)
                map.addObject ( vm.drawingMarkersGroup ) //drawMarker )
            }
            })
            
        }

        //Add Overlay (draw mode overlay="true" or normal mode with draw="overlay" )
        if ( (typeof this.$attrs.overlay != 'undefined' || ( typeof this.$attrs.draw != 'undefined' && this.$attrs.draw === 'overlay' )) && this.$attrs.overlaySrc ){
            // pre-load the bitmaps
            (function() {
                var i = 0,
                    img;
                for (; i <= 10; i++) {
                    img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.src = vm.$attrs.overlaySrc //'https://heremaps.github.io/maps-api-for-javascript-examples/image-overlay/data/' + i + '.png';
                    vm.overlayImg.push(img);
                }
            }());
        }

        //enable/disable default UI ($attrs.ui)
        if ( typeof ( this.$attrs.ui ) === 'undefined' || this.$attrs.ui ){
            var ui = H.ui.UI.createDefault(map, defaultLayers,window.navigator.userLanguage || window.navigator.language)
            this.ui = ui
        }

        //check is destination is set then routing
        if ( !this.$attrs.destination ){
            if ( this.$attrs.bubble ){
                this.setBubble ( coords , ui , this.$attrs.bubble )
            } 
            var icon = new H.map.Icon( this.markerIcon(0) )
            var marker = new H.map.Marker( coords, {icon: icon})
            map.addObject ( marker )
        }
        this.loading = false
        this.map = map
        typeof this.$attrs.interactive ? this.setInteractive(map) : null

        //draw an object not in draw mode set by $attrs.draw (type) and  $attrs.drawCoords
        if ( typeof this.$attrs.draw != 'undefined' ){
            this.drawObject()
            if ( typeof this.$attrs.drawInfo != 'undefined'  ){
                this.setBubble ( { lat: this.$attrs.drawCoords.split(',')[0] , lng: this.$attrs.drawCoords.split(',')[1] } , this.ui , this.$attrs.drawInfo )
            }
        }
    },

    //create routing 
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
    
    //geolocate address
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

    //geolocation logic 
    //if address or destination calculate geo coordinates otherwise check origin and endpoint
    geoLocation(){
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

    //marker icon
    markerIcon(pos){      
      return '<svg class="squish" width="24" height="52px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 72" fill="' + this.colors[pos] + '"><path d="M24,0 C11.406,0 0,10.209 0,22.806 C0,35.4 10.407,50.436 24,72 C37.593,50.436 48,35.4 48,22.806 C48,10.209 36.597,0 24,0 L24,0 Z M24,33 C19.029,33 15,28.971 15,24 C15,19.029 19.029,15 24,15 C28.971,15 33,19.029 33,24 C33,28.971 28.971,33 24,33 L24,33 Z"></path></svg>'
    },

    //draw icon points: create small dots on the map on user click
    drawIcon(){
      return '<svg width="10" height="10" version="1.1" xmlns="http://www.w3.org/2000/svg">' +
            '<circle cx="5" cy="5" r="4" fill="#333" stroke="#333" stroke-width="1"/>' +
            '</svg>'
    },

    //create a bubble
    setBubble( coords , ui , text ){
      let myBubble = new H.ui.InfoBubble( coords , {
          content: text || this.tags[0]
      })
      // Add info bubble to the UI:
      ui.addBubble(myBubble);
    },

    //add map interactivity
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
      // calculate infobubble position from the cursor screen coordinate (disabled in draw mode)
      if ( typeof this.$attrs.mode === 'undefined' ){
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
      } else {
        if ( this.$attrs.mode === 'draw' ){
          this.coords = { 
            lat: evt.currentPointer.viewportX,
            lng: evt.currentPointer.viewportY
        }
      }
      }
    },
    
    //draw an object (line,polygon,overlay at given coords)
    //@ $attrs.draw => string => line,polygon,overlay
    //@ $attrs.drawCoords => string => coords
    drawObject(){
      this.markers = this.$attrs.drawCoords.split(',')
      this.coords = this.markers
      if ( this.$attrs.draw === 'line' ){
        this.drawPolyline()
      }
      if ( this.$attrs.draw === 'polygon' ){
        this.drawPolygon()
      }
      if ( this.$attrs.draw === 'overlay' ){  
        let geoCoords = this.$attrs.drawCoords.split(',')
        this.markers = [
          {
            lat: geoCoords[0],
            lng: geoCoords[1]
          },
          {
            lat: geoCoords[2],
            lng: geoCoords[3]
          }
        ]
        this.overlayPicture()
      }
    },

    //draw a polyline
    drawPolyline(){
      this.drawingType = 'line'
      this.startDraw =! this.startDraw
      let arr = this.coords , vm = this
      vm.drawingPoints = []
      vm.drawingMarkersGroup ? vm.drawingMarkersGroup.removeAll() : null
      let svgCircle = '<svg width="20" height="20" version="1.1" xmlns="http://www.w3.org/2000/svg">' +
            '<circle cx="10" cy="10" r="7" fill="transparent" stroke="red" stroke-width="4"/>' +
            '</svg>'

      let lineString = new H.geo.LineString ( arr ) 
      vm.drawingPoints = arr
      let polyline = new H.map.Polyline(
        lineString, { style: { lineWidth: 4 ,strokeColor : vm.$attrs.drawStrokeColor || '#999' }}
      )
      //create object
      vm.objectGroup ( polyline )
    },



    //draw a polygon
    drawPolygon(){
      this.drawingType = 'polygon'
      this.startDraw =! this.startDraw
      let poly = this.coords
      let vm = this
      vm.drawingMarkersGroup ? vm.drawingMarkersGroup.removeAll() : null
      let lineString = new H.geo.LineString ( poly , 'values lat lng alt' )
      vm.drawingPoints = poly
      let polygon = 
        new H.map.Polygon(lineString, {
          style: {
            fillColor: vm.$attrs.drawFillColor || 'rgba(0, 85, 170, 0.4)',
            strokeColor: vm.$attrs.drawStrokeColor || '#555',
            lineWidth: 4
          }
        })
      //create object
      vm.objectGroup ( polygon )
    },

        //add a picture overlay
    overlayPicture(){
        this.drawingType = 'overlay'
        this.startDraw = !this.startDraw
        let imgCounter = 0 , vm = this
        vm.drawingMarkersGroup ? vm.drawingMarkersGroup.removeAll() : null
        let coords = [ vm.markers[0].lat , vm.markers[0].lng, vm.markers[1].lat , vm.markers[1].lng ]
        vm.drawingPoints = coords
        // create an overlay that will use a weather map as a bitmap
        let overlay = new H.map.Overlay(
          new H.geo.Rect( vm.markers[0].lat , vm.markers[0].lng, vm.markers[1].lat , vm.markers[1].lng ),
          vm.overlayImg[imgCounter],
          {
            // the bitmap is frequently updated mark the object as volatile
            volatility: true
          }
        );

        let vertice = 'vm.markers[0].lat , vm.markers[0].lng,vm.markers[1].lat , vm.markers[1].lng'
        let mainGroup = new H.map.Group({
          volatility: true, // mark the group as volatile for smooth dragging of all it's objects
          objects: [overlay]
        })
        vm.renderedDrawingGroup = mainGroup
        // update overlay's bitmap every 250 milliseconds
        setInterval(function() {
          imgCounter = imgCounter < 10 ? ++imgCounter : 0;
          overlay.setBitmap(vm.overlayImg[imgCounter]);
        }, 250);

        // add overlay to the map
        vm.map.addObject(mainGroup);
      
    },

    svgCircle(){
      return '<svg width="20" height="20" version="1.1" xmlns="http://www.w3.org/2000/svg">' +
            '<circle cx="10" cy="10" r="7" fill="transparent" stroke="red" stroke-width="4"/>' +
            '</svg>'
    },

    objectGroup(element){
      let vm = this ,
      verticeGroup = new H.map.Group({
        visibility: false
      }),
      mainGroup = new H.map.Group({
        volatility: true, // mark the group as volatile for smooth dragging of all it's objects
        objects: [element, verticeGroup]
      }),
      elementTimeout
      vm.$attrs.draw ? null : element.draggable = true
      //create the rendered polyline as group object
      vm.renderedDrawingGroup = mainGroup
      
      vm.map.addObject(mainGroup)

      if ( typeof vm.$attrs.draw === 'undefined' ){
        // create markers for each polyline's vertice which will be used for dragging

        if ( vm.drawingType === 'line' ){
          element.getGeometry().eachLatLngAlt(function(lat, lng, alt, index) {
            var vertice = new H.map.Marker(
              {lat, lng},
              {
                icon: new H.map.Icon(vm.svgCircle(), {anchor: {x: 10, y: 10}})
              } 
            );
            vertice.draggable = true;
            vertice.setData({'verticeIndex': index})
            verticeGroup.addObject(vertice);
          })
        }
        if ( vm.drawingType === 'polygon' ){
          element.getGeometry().getExterior().eachLatLngAlt(function(lat, lng, alt, index) {
            var vertice = new H.map.Marker(
              {lat, lng},
              {
                icon: new H.map.Icon(vm.svgCircle(), {anchor: {x: 10, y: 10}})
              }
            );
            vertice.draggable = true
            vertice.setData({'verticeIndex': index})
            verticeGroup.addObject(vertice);
          })
        }

      

        // event listener for main group to show markers if moved in with mouse (or touched on touch devices)
        mainGroup.addEventListener('pointerenter', function(evt) {
          if (elementTimeout) {
            clearTimeout(elementTimeout)
            elementTimeout = null
          }

          // show vertice markers
          verticeGroup.setVisibility(true)
        }, true)

        // event listener for main group to hide vertice markers if moved out with mouse (or released finger on touch devices)
        // the vertice markers are hidden on touch devices after specific timeout
        mainGroup.addEventListener('pointerleave', function(evt) {
          var timeout = (evt.currentPointer.type == 'touch') ? 1000 : 0

          // hide vertice markers
          elementTimeout = setTimeout(function() {
            verticeGroup.setVisibility(false);
          }, timeout);
        }, true);

        // event listener for vertice markers group to change the cursor to pointer if mouse position enters this group
        verticeGroup.addEventListener('pointerenter', function(evt) {
          document.body.style.cursor = 'pointer';
        }, true);

        // event listener for vertice markers group to change the cursor to default if mouse leaves this group
        verticeGroup.addEventListener('pointerleave', function(evt) {
          document.body.style.cursor = 'default';
        }, true);

        if ( vm.drawingType === 'line' ){
          // event listener for vertice markers group to resize the geo polyline object if dragging over markers
          verticeGroup.addEventListener('drag', function(evt) {
            var pointer = evt.currentPointer,
                geoLineString = element.getGeometry(),
                geoPoint = vm.map.screenToGeo(pointer.viewportX, pointer.viewportY);

            // set new position for vertice marker
            evt.target.setGeometry(geoPoint);

            // set new position for polyline's vertice
            geoLineString.removePoint(evt.target.getData()['verticeIndex']);
            geoLineString.insertPoint(evt.target.getData()['verticeIndex'], geoPoint);
            element.setGeometry(geoLineString);
            
            // stop propagating the drag event, so the map doesn't move
            evt.stopPropagation();
            vm.drawingPoints = geoLineString.W
          }, true);
        }
        if ( vm.drawingType === 'polygon' ){
          verticeGroup.addEventListener('drag', function(evt) {
            var pointer = evt.currentPointer,
                geoLineString = element.getGeometry().getExterior(),
                geoPoint = vm.map.screenToGeo(pointer.viewportX, pointer.viewportY);

            // set new position for vertice marker
            evt.target.setGeometry(geoPoint);

            // set new position for polygon's vertice
            geoLineString.removePoint(evt.target.getData()['verticeIndex']);
            geoLineString.insertPoint(evt.target.getData()['verticeIndex'], geoPoint);
            element.setGeometry(new H.geo.Polygon(geoLineString));
            vm.drawingPoints = geoLineString.W
            // stop propagating the drag event, so the map doesn't move
            evt.stopPropagation();
          }, true);
        }
      }
    },

    //show export data to create a map
    getObjectData(){
      this.showData =! this.showData 
      let keys = Object.keys(this.$attrs).map ( key => {
        if ( this.drawingType != 'overlay' ){
          if ( key != 'overlay' && key != 'overlaySrc' ){
            return key
          } else {
            return null
          }
        } else {
          return key
        }
      })
      this.exportData = {}
      keys.forEach ( key => {
        if ( key ){
          this.exportData[key] = this.$attrs[key]
        }
      })
    },

    //remove current group object created in draw mode
    removeRenderedGroup(){
      this.renderedDrawingGroup.removeAll()
      this.coords = []
      this.markers = []
      this.drawingMarkersGroup = new H.map.Group()
      this.startDraw = true
      this.showData = false
    }

  },

  mounted(){
    if ( this.$attrs.colors && this.$attrs.colors.split(',').length === 2 ){
        this.colors = this.$attrs.colors.split(',')
    }
    this.exportData = this.$attrs
    this.$loadMapScript().then( ( resp ) => {
       this.init()
    }).catch(() => {
        console.log ( 'Map Scripts not loaded')
    })
  }
}
</script>

<style scoped>
.here-map-container {
  position:relative;

}

.here-map-coords {
  position:absolute;
  top:-2rem;
  right:2px;
  opacity:1;
  font-size:.8rem;
  background:#fefefe;
  cursor:pointer;
  transition: 1s all;
  display:flex;
  flex-direction:row;
  align-items:center;
  padding:.3rem;
  border:1px solid #eaeaea;
}

.here-map-coords > button {
  font-size:.7rem;
  margin-right:.3rem;
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

.here-map-data {
  position:absolute;
  top:3rem;
  width: 20rem;
  background:#fff;
  border:1px solid #eee;
  padding:.3rem;
  z-index:2000000;
  transition: .5s all linear;
  text-align:left;
  font-size:small;
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