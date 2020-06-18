const baseURL = 'https://js.api.here.com/v3/3.1/'
const src = 'mapsjs.bundle.js' //'mapsjs-core.js','mapsjs-service.js','mapsjs-ui.js','mapsjs-mapevents.js']
const styles = 'mapsjs-ui.css'


const LoadMapScript = {
    install: function (Vue) {
      Vue.LoadMapScript = Vue.prototype.$loadMapScript = function ( ) { // eslint-disable-line no-param-reassign
        return new Promise(function (resolve, reject) {
            if (document.querySelector('script[src="' + baseURL + src + '"]')) {
                resolve();
                return;
            }
    
            const el = document.createElement('SCRIPT');
    
            el.src = baseURL + src;
            el.defer = true
            el.async = true;
            el.type = 'module';
    
            el.addEventListener('load', resolve);
            el.addEventListener('error', reject);
            el.addEventListener('abort', reject);
    
            document.head.appendChild(el);
            let hereMapStyle = document.createElement('LINK')
            let url = baseURL + styles
            hereMapStyle.setAttribute('href' , url )
            hereMapStyle.setAttribute( 'rel' , 'stylesheet' )
            hereMapStyle.setAttribute( 'type' , 'text/css' )
            document.head.appendChild(hereMapStyle)
        });
      };
  
      Vue.LoadMapScript = Vue.prototype.$unloadMapScript = function () { // eslint-disable-line no-param-reassign
        return new Promise(function (resolve, reject) {
          const el = document.querySelector('script[src="' + baseUrl + src + '"]');
  
          if (!el) {
            reject();
  
            return;
          }
  
          document.head.removeChild(el);
  
          resolve();
        });
      };
    },
  };
  
export default LoadMapScript;
