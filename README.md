# vue-here-map

**vue-here-map** is an advanced vue component to render detailed map in your Vue component. 

vue-here-map uses [here.com](https://here.com) map service and in order to work you need an APIKEY that you can get with a [FREEMIUM account](https://developer.here.com/sign-up?create=Freemium-Basic&keepState=true&step=account).


## Demo

Check a [demo](https://swina.github.io/vue-here-map)

## Features

- uses [https://here.com] map service (free up to 250K calls monthly)
- address auto-complete (you don't need to give exact latitude and longitude data) 
- routing calculation and display (from address to destination )
- traffic indication (with incidents and viability)
- markers custom colors
- 4 positions info box with your content
- draw mode to add line/polygon/overlay image to map and export data to recreate the same map/objects

## Usage

1. Install thru **npm**


``` 
npm install @bit/swina.vue-components.global.vue-here-map 
```

2. Load scripts in your main.js

```

import LoadMapScript from '@bit/swina.vue-components.global.vue-here-map/here.maps.js'
Vue.use ( LoadMapScript )

```

3. Include in your component

```
<template>
    <here-map 
      address="Via Nazionale,Roma,Italy" 
      destination="Via Conca d'Oro,Roma,Italy" 
      colors="green,red"
      :interactive="true"
      :traffic="true" 
      :infoBox="true" 
      box="bottom left">
      <div slot="infoBox">
        <p><small>This is a demo of vue-here-map</small></p>
      </div>
    </here-map>
</template>

<script>
import HereMap from '@bit/swina.vue-components.global.vue-here-map/HereMaps.vue'
export default {
  name: 'myComponent',
  components:{
    HereMap
  }
}
</script>
```

4. Create a .env to set the APIKEY

In order to use the component you need a valid APIKEY from here.com.
Create an .env file in the root of your project and add the following line.

***We suggest to create a domain whitelist from your account settings in order to use your APIKEY only from those domains***

```
VUE_APP_HERE_APIKEY=your_here_api_key
```


## Attributes

### Coords mode 

**origin** *(string lat,lng values separated by comma)*

Set origin coords to display on the map. 

```
<here-map origin="41.89953,12.4914"/>
```

**endpoint** *(string lat,lng values separated by comma)*

Set endpoint coords to display on the map (auto routing mode)

```
<here-map origin="41.89953,12.4914" endpoint="41.94032,12.5247"/>
```

### Autocomplete mode 

**address** *(string)*

Autocomplete mode origin address to display on the map as the origin point (Start address in routing mode)

```
<here-map address="5th Ave,New York,USA"/>
```

**destination** *(string)*

Autocomplete mode destination address. Using the destination address **vue-here-map** automatically calculate and visualize the routing

```
<here-map address="5th Ave,New York,USA" destination="42nd Street,New York,USA"/>
```

### Options 

**width** *(string)*

Map width in px. Ex. 800px

Normally vue-here-map calculate the max width available.

**ui**  *(true,**false**)*

Enable map default UI (zoom,extra options)


**traffic** *(true,**false**)*

Display traffic information. You can omit this attribute since the map has is own UI from where you can enable traffic information (incidents included)

```
<here-map address="5th Ave,New York,USA" destination="42nd Street,New York,USA" :traffic="true"/>
```

**bubble** *(string)*

Create a bubble with the attribute text at the center point of the map.



**infoBox** *(true,**false**)*

Enable a box with your content. If enabled add your content using the slot ```infoBox```

```
<here-map 
    address="5th Ave,New York,USA"
    :infoBox="true">
    <div slot="infoBox">
        <p><small>This is a demo of vue-here-map</small></p>
    </div>
</here-map>
```

**box** *(string)*

Set the infoBox position. Available options : *top left* , *top right* , *bottom left* , *bottom right*. Default is *bottom left*.


```
<here-map 
    address="5th Ave,New York,USA"
    :infoBox="true"
    box="top left">
    <div slot="infoBox">
        <p><small>This is a demo of vue-here-map</small></p>
    </div>
</here-map>
```

**color** *(string)*

Set the color of the marker(s). When using with destination assign 2 colors separated by comma. Default is *green,red*

```
<here-map 
    address="5th Ave,New York,USA"
    colors="blue,red"
</here-map>
```

**interactive** *(true,**false**)*

When enabled clicking on city names display the population (if available)

```
<here-map 
    address="5th Ave,New York,USA"
    :interactive="true">
</here-map>
```

**draw** *(string)*

Define which object you want to add to the map. 

Possible values are *line* , *polygon* , *overlay*

**drawCoords** *(string)*

Required if **draw** attributes is set

Define the coordinates that correspond to the object vertices.

```
<here-map address="5th Ave,New York,USA" 
    draw = "polygon"
    drawCoords = "40.777069137384665, -73.96368326374564, 0 , 40.77281827263044, -73.96033586689505, 0, 40.77281827263044, -73.96368326374564, 0"/>
```

Will display a triangle with vertices coordinates defined in the **drawCoords** attribute.
For line and polygon each vertix has to be defined as *lat*,*lng*,*alt* (latitude,longitude,altitude)

**overlaySrc**

Required if **draw** attribute is *overlay*

Input a valid image URL. This is the image that will be applied as overlay to the map. 

**drawCoords** for image overlay is a serie of 2 coordinates representing the upper left corner and the bottom right corner of the image container

```
<here-map address="5th Ave,New York,USA" 
    draw = "overlay"
    drawCoords = "40.776406176384654, -73.96370901321411, 40.77336427053755, -73.96068777324169"/>
    overlaySrc= "https://source.unsplash.com/random/800x600?transparent"/>
```
Will display a random image at coords defined in drawCoords.

**drawFillColor** *(string)*

Define the fill color (in rgba format) of a polygon created on the map

```
<here-map address="5th Ave,New York,USA" 
    drawFillColor = "rgba(0, 85, 170, 0.4)"
    draw = "polygon"
    drawCoords = "40.777069137384665, -73.96368326374564, 0 , 40.77281827263044, -73.96033586689505, 0, 40.77281827263044, -73.96368326374564, 0"/>
```    

**drawStrokeColor** *(string)*

Define the stroke color of a line/polygon

```
<here-map address="5th Ave,New York,USA" 
    drawFillColor = "rgba(0, 85, 170, 0.4)"
    drawStrokeColor = "#ff0000"
    draw = "polygon"
    drawCoords = "40.777069137384665, -73.96368326374564, 0 , 40.77281827263044, -73.96033586689505, 0, 40.77281827263044, -73.96368326374564, 0"/>
```    

**drawInfo** *(string)*

Create a bubble on the first vertix of a polyline/polygon/image overlay created on the map



## Draw Mode

Draw mode enables to add a polyline/polygon/image overlay on the current map.

Polyline and polygon vertices are draggable and so you can shape as you like.

To enable Draw mode you have to set the following attribute:

```
<here-map address="5th Ave,New York,USA" mode="draw"/>
```

In Draw mode if you click on the map a small black dot will be added.

**Create a polyline**

- Click on the map at the location you want to create at least 2 points on the map. 
- Click on Draw Line button

**Create a polygon**

- Click on the map to set the drawing points (black dots). You need at least 3 points.
- Click on Draw Polygon button

**Create an image overlay**

You can set an overlay image to your map. In order to enable the overlay add the following attributes

```
<here-map ... mode="draw" :overlay="true" overlaySrc="https://source.unsplash.com/random/800x600?transparent"/>
```

*overlaySrc has to be a valid image url*

- Click on the map to set 2 points: first point is the top left corner and second the bottom right corner of your image container
- Click Overlay Image button


**Colors**

You can assign custom colors to lines ad polygons with the following attributes:

```
<here-map ... mode="draw" drawStrokeColor="#222" drawFillColor="rgba(0,0,0,.5)"/>
```

*drawFillColor must be in rgba format*




**Export Data**

When you create a polyline/polygon/image overlay you can export the data to recreate the same map with the object you created, without using Draw mode.

Click the Data button.

You will get a here-map tag to recreate the current map and objects.

## Examples

*Autocomplete indicates that vue-here-map will calculate geocoords of an address.*

### Simple map, no autocomplete

```
<here-map origin="41.89953,12.4914"/>
```

### Routing map, no autocomplete

```
<here-map origin="41.89953,12.4914" endpont="42.89953,10.4914/>
```

### Automplete map

```
<here-map address="5th Ave,New York,USA"/>
```

### Routing map with Autocomplete

```
<here-map address="5th Ave,New York,USA" destination="Park Ave.,New York,USA"/>
```

### Version 0.0.3
- added bubble attribute
- added draw mode to add polyline/polygon/image overlay to map
- export data to recreate same map objects included

### Version 0.0.2
- fixed markers color 

### Version 0.0.2
- fixed minor issues
- add **ui** attribute to display default user interface and controls
- fixed autocomplete function


### Version 0.0.1
First release

## Issues 
Open any issue on github.
