# vue-here-map

**vue-here-map** is an advanced vue component to render detailed map in your Vue component. 

vue-here-map uses [here.com](here.com) map service and in order to work you need an APIKEY that you can get with a [FREEMIUM account](https://developer.here.com/sign-up?create=Freemium-Basic&keepState=true&step=account).


## Features

- uses [here.com] map service (free up to 250K calls monthly)
- address auto-complete (you don't need to give exact latitude and longitude data) 
- routing calculation and display (from address to destination )
- traffic indication (with incidents and viability)
- markers custom colors
- 4 positions info box with your content

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

**traffic** *(true,**false**)*

Display traffic information. You can omit this attribute since the map has is own UI from where you can enable traffic information (incidents included)

```
<here-map address="5th Ave,New York,USA" destination="42nd Street,New York,USA" :traffic="true"/>
```

**infoBox** *(true,**false**)*

Enable a box with your content. If enabled add your content using the slot ```infoBox```

```
<here-map ...>
    <div slot="infoBox">
        <p><small>This is a demo of vue-here-map</small></p>
    </div>
</here-map>
```

**box** *(string)*

Set the infoBox position. Available options : *top left* , *top right* , *bottom left* , *bottom right*. Default is *bottom left*.

**color** *(string)*

Set the color of the marker(s). When using with destination assign 2 colors separated by comma. Default is *green,red*

**interactive** *(true,**false**)*

When enabled clicking on city names display the population (if available)



## Version 0.0.1
First release

## Issues 
Open any issue on github.
