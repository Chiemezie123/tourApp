
export const mapContainer =(locations)=>{
    mapboxgl.accessToken ='pk.eyJ1IjoiZnV6enlsb3JkMTIzIiwiYSI6ImNtM3B6dzlxdDBrcXQya3NjNDVhaHEwZXMifQ.f3mouYAI3VULrkJtj8En3A';



    // Initialize the map
    var map = new mapboxgl.Map({
      container: 'map', // The ID of the container element
      style: 'mapbox://styles/fuzzylord123/cm3qlbrxw002z01s6ghgihdeb', // Mapbox style
      // center: [-118.270062, 34.00344], // Optional: Set an initial center (longitude, latitude)
      zoom: 1, // Optional: Set an initial zoom level
      scrollZoom: true,
      // interactive: false,
    });
    
    const bounds = new mapboxgl.LngLatBounds();
    
    locations.forEach((element) => {
      //  create marker
      const el = document.createElement('div');
      el.className = 'marker';
      // add marker
      new mapboxgl.Marker({
        element: el,
        anchor: 'bottom',
      })
        .setLngLat(element.coordinates)
        .addTo(map);
    
      new mapboxgl.Popup({
        offset: 30,
      })
        .setLngLat(element.coordinates)
        .setHTML(`<p>day:${element.day}: ${element.description}</p>`)
        .addTo(map);
      // extend map bounds to include current location
      bounds.extend(element.coordinates);
    });
    
    map.fitBounds(bounds, {
      padding: {
        top: 200,
        bottom: 200,
        left: 200,
        right: 200,
      },
    });
} 





// import { Loader } from '@googlemaps/js-api-loader';

// const loader = new Loader({
//   apiKey: 'YOUR_API_KEY',
//   version: 'weekly', // or 'beta', 'daily'
//   libraries: ['places', 'drawing'], // optional libraries
// });

// loader.load().then((google) => {
//   // Google Maps API is now loaded and available as 'google'

//   // Get the map container element
//   const mapContainer = document.getElementById('map');

//   // Create a new map instance
//   const map = new google.maps.Map(mapContainer, {
//     center: { lat: -34.397, lng: 150.644 },
//     zoom: 8,
//   });
// });