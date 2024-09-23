import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import RotateMode from 'mapbox-gl-draw-rotate-mode'; // Import the rotation mode
import * as turf from '@turf/turf'; // Import turf

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

const Map = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const drawRef = useRef(null);
  const geocoderRef = useRef(null);
  const [measurementMode, setMeasurementMode] = useState('distance');
  const [results, setResults] = useState([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const distanceFeaturesRef = useRef([]);
  const areaFeaturesRef = useRef([]);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/satellite-streets-v12');

  const handleMeasurementModeChange = (mode) => {
    setMeasurementMode(mode);
    setResults([]);
    distanceFeaturesRef.current = [];
    areaFeaturesRef.current = [];
    localStorage.removeItem('mapResults');
    localStorage.removeItem('distanceFeatures');
    localStorage.removeItem('areaFeatures');

    if (mapRef.current.getSource('distance-geojson')) {
      mapRef.current.getSource('distance-geojson').setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
    if (mapRef.current.getSource('area-geojson')) {
      mapRef.current.getSource('area-geojson').setData({
        type: 'FeatureCollection',
        features: [],
      });
    }

    if (mode === 'area') {
      drawRef.current.changeMode('draw_polygon');
    } else if (mode === 'distance') {
      drawRef.current.changeMode('simple_select');
    } else if (mode === 'rotate') {
      drawRef.current.changeMode('rotate'); // Switch to rotate mode
    }
  };

  const handleMapClick = useCallback((e) => {
    if (measurementMode === 'distance') {
      const point = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [e.lngLat.lng, e.lngLat.lat],
        },
        properties: {
          id: String(new Date().getTime()),
        },
      };

      distanceFeaturesRef.current.push(point);

      if (distanceFeaturesRef.current.length > 1) {
        const linestring = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: distanceFeaturesRef.current.map(
              (point) => point.geometry.coordinates
            ),
          },
        };

        const validCoordinates = linestring.geometry.coordinates.every(
          (coord) => Array.isArray(coord) && coord.length === 2 && coord.every(Number.isFinite)
        );

        if (validCoordinates) {
          const totalDistance = linestring.geometry.coordinates.reduce((acc, coord, index, arr) => {
            if (index === 0) return acc;
            const from = turf.point(arr[index - 1]);
            const to = turf.point(coord);
            const distance = turf.distance(from, to);
            return acc + distance;
          }, 0);

          const updatedResults = [`${totalDistance.toFixed(2)} km`];
          setResults(updatedResults);
          localStorage.setItem('mapResults', JSON.stringify(updatedResults));
          localStorage.setItem('distanceFeatures', JSON.stringify(distanceFeaturesRef.current));

          distanceFeaturesRef.current.push(linestring);

          mapRef.current.getSource('distance-geojson').setData({
            type: 'FeatureCollection',
            features: distanceFeaturesRef.current,
          });
        }
      }
    }
  }, [measurementMode]);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic2hhcmplZWwwNyIsImEiOiJjbGt0Y3F4cjQwMnVoM2tvMDhqNTk1MzA3In0.c_2wdbcMLmCAHwx7E-2J2Q';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [2.349958, 48.836873],
      zoom: 12,
      pitch: 60,
      bearing: -17.6,
    });

    drawRef.current = new MapboxDraw({
      displayControlsDefault: false,
      modes: {
        ...MapboxDraw.modes,
        rotate: RotateMode, // Add rotate mode
      },
      controls: {
        polygon: true,
        trash: true,
      },
    });
    mapRef.current.addControl(drawRef.current);

    // Add zoom controls below the existing draw and delete controls
    const navControl = new mapboxgl.NavigationControl({
      showCompass: false, // If you don't want to show the compass
    });
    mapRef.current.addControl(navControl, 'top-left'); // Add controls to the top-left below draw/delete

    mapRef.current.on('load', () => {
      // Add sources and layers for distance and area features
      mapRef.current.addSource('distance-geojson', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: distanceFeaturesRef.current,
        },
      });

      mapRef.current.addLayer({
        id: 'measure-points',
        type: 'circle',
        source: 'distance-geojson',
        paint: {
          'circle-radius': 5,
          'circle-color': '#007cbf',
        },
        filter: ['in', '$type', 'Point'],
      });

      mapRef.current.addLayer({
        id: 'measure-lines',
        type: 'line',
        source: 'distance-geojson',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#007cbf',
          'line-width': 3,
        },
        filter: ['in', '$type', 'LineString'],
      });

      mapRef.current.addSource('area-geojson', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: areaFeaturesRef.current,
        },
      });

      mapRef.current.addLayer({
        id: 'area-polygon',
        type: 'fill',
        source: 'area-geojson',
        paint: {
          'fill-color': '#088',
          'fill-opacity': 0.5,
        },
      });

      // Load saved features if they exist
      if (distanceFeaturesRef.current.length > 0) {
        mapRef.current.getSource('distance-geojson').setData({
          type: 'FeatureCollection',
          features: distanceFeaturesRef.current,
        });
      }

      if (areaFeaturesRef.current.length > 0) {
        mapRef.current.getSource('area-geojson').setData({
          type: 'FeatureCollection',
          features: areaFeaturesRef.current,
        });
      }

      mapRef.current.on('click', handleMapClick);
      mapRef.current.on('draw.create', updateArea);
      mapRef.current.on('draw.update', updateArea);
      mapRef.current.on('draw.delete', updateArea);

      // Add the 3D buildings layer
      mapRef.current.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15, // Only show 3D buildings when zoomed in
        'paint': {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.05, ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.05, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      });

      // Restrict the 3D buildings to the default coordinates area
      mapRef.current.on('move', () => {
        const center = mapRef.current.getCenter();
        const radius = 2; // 2km radius

        // Check if the map center is within the defined radius from the default coordinates
        const isWithinArea = turf.distance(turf.point([2.349958, 48.836873]), turf.point([center.lng, center.lat])) <= radius;

        // Toggle 3D buildings visibility based on the condition
        mapRef.current.setLayoutProperty('3d-buildings', 'visibility', isWithinArea ? 'visible' : 'none');
      });
    });

    // Clear the geocoder container before adding the Geocoder to the sidebar
    const geocoderContainer = document.getElementById('geocoder');
    geocoderContainer.innerHTML = '';

    geocoderRef.current = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: 'Search for Location',
    });

    geocoderContainer.appendChild(geocoderRef.current.onAdd(mapRef.current));

    // Clean up on unmount
    return () => {
      mapRef.current.off('click', handleMapClick);
      mapRef.current.off('draw.create', updateArea);
      mapRef.current.off('draw.update', updateArea);
      mapRef.current.off('draw.delete', updateArea);
      mapRef.current.remove();
    };
  }, [measurementMode, mapStyle, handleMapClick]);

  const updateArea = () => {
    const data = drawRef.current.getAll();
    const polygons = data.features.filter(
      (feature) => feature.geometry.type === 'Polygon'
    );

    if (polygons.length > 0) {
      try {
        areaFeaturesRef.current = polygons;

        const totalArea = polygons.reduce((acc, polygon) => {
          return acc + turf.area(polygon);
        }, 0);

        const updatedResults = [`${(Math.round(totalArea * 100) / 100).toFixed(2)} square meters`];
        setResults(updatedResults);
        localStorage.setItem('mapResults', JSON.stringify(updatedResults));
        localStorage.setItem('areaFeatures', JSON.stringify(areaFeaturesRef.current));

        mapRef.current.getSource('area-geojson').setData({
          type: 'FeatureCollection',
          features: areaFeaturesRef.current,
        });
      } catch (error) {
        console.error('Error calculating area: ', error);
      }
    } else {
      setResults([]);
      localStorage.removeItem('mapResults');
      localStorage.removeItem('areaFeatures');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleMapStyle = () => {
    const newStyle = mapStyle === 'mapbox://styles/mapbox/satellite-streets-v12'
      ? 'mapbox://styles/mapbox/streets-v12'
      : 'mapbox://styles/mapbox/satellite-streets-v12';
    setMapStyle(newStyle);
  };

  const resetNorth = () => {
    mapRef.current.resetNorth();
    mapRef.current.resetNorthPitch();
  };

  const findMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        mapRef.current.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 14,
          essential: true, // This animation is considered essential with respect to prefers-reduced-motion
        });
      });
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handlePan = (direction) => {
    const moveBy = 100; // Adjust this value as needed
    switch (direction) {
      case 'up':
        mapRef.current.panBy([0, -moveBy]);
        break;
      case 'down':
        mapRef.current.panBy([0, moveBy]);
        break;
      case 'left':
        mapRef.current.panBy([-moveBy, 0]);
        break;
      case 'right':
        mapRef.current.panBy([moveBy, 0]);
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      {isSidebarVisible && (
  <div
    style={{
      width: '250px',
      backgroundColor: '#2e4764', 
      padding: '20px',
      boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
      zIndex: 1,
    }}
  >
    {/* Search Box */}
    <div
      id="geocoder"
      style={{
        marginBottom: '20px',
        borderRadius: '9999px', // Fully circular corners
        overflow: 'hidden',  // Ensure the rounding is applied cleanly
      }}
    />
    
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
      <button
        onClick={() => handleMeasurementModeChange('distance')}
        style={{
          flex: 1,
          padding: '8px 12px',  // Reduced padding
          backgroundColor: '#fff', // Set button background to white
          color: measurementMode === 'distance' ? '#FFA500' : '#000', // Text color: black, orangy-yellow if selected
          border: measurementMode === 'distance' ? '2px solid #FFA500' : 'none', // Border color when selected, none when not selected
          borderRadius: '9999px', // Fully circular corners
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
        }}
      >
        Distance
      </button>
      <button
        onClick={() => handleMeasurementModeChange('area')}
        style={{
          flex: 1,
          padding: '8px 12px',  // Reduced padding
          backgroundColor: '#fff', // Set button background to white
          color: measurementMode === 'area' ? '#FFA500' : '#000', // Text color: black, orangy-yellow if selected
          border: measurementMode === 'area' ? '2px solid #FFA500' : 'none', // Border color when selected, none when not selected
          borderRadius: '9999px', // Fully circular corners
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
        }}
      >
        Area
      </button>
    </div>

    {/* Result Box */}
    <div
      style={{
        backgroundColor: '#fff',
        color: '#000',
        marginTop: '20px',
        padding: '5px', // Reduced padding to make it more compact
        borderRadius: '9999px', // Fully circular corners
        border: '1px solid #ccc', // Add a light border similar to the search box
        height: '30px', // Reduced height to make it smaller
        overflowY: 'auto', // Add scroll if content overflows
        fontWeight: 'bold',
        fontSize: '14px', // Slightly reduced font size
        textAlign: 'center', // Center-align the text
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // Vertically and horizontally center the text
      }}
    >
      {results.length > 0 ? results[0] : 'No results yet'} {/* Display the first result or default text */}
    </div>
  </div>
)}

      {/* Map Container */}
      <div ref={mapContainerRef} style={{ flex: 1 }} id="map" />

      {/* Custom Controls */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',  // Adjust this to move the control higher or lower
          right: '50px',   // Adjust this to move the control left or right
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        {/* Pan Controls */}
        <button onClick={() => handlePan('up')} style={controlButtonStyle}>
          ↑
        </button>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={() => handlePan('left')} style={controlButtonStyle}>
            ←
          </button>
          <button onClick={resetNorth} style={controlButtonStyle}>
            👁
          </button>
          <button onClick={() => handlePan('right')} style={controlButtonStyle}>
            →
          </button>
        </div>
        <button onClick={() => handlePan('down')} style={controlButtonStyle}>
          ↓
        </button>
      </div>

      {/* New Functionalities */}
      <div
        style={{
          position: 'absolute',
          bottom: '30px',  // Position it just below the directional controls
          right: '50px',   // Align horizontally to the right of the panning controls
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'row',  // Set this to row for horizontal alignment
          gap: '10px',    // Add gap between the buttons
        }}
      >
        <button onClick={toggleMapStyle} style={newControlButtonStyle}>
          🗺️
        </button>
        <button onClick={resetNorth} style={newControlButtonStyle}>
          🧭
        </button>
        <button onClick={findMyLocation} style={newControlButtonStyle}>
          📍
        </button>
      </div>
    </div>
  );
};

const controlButtonStyle = {
  width: '30px',
  height: '30px',
  backgroundColor: '#007cbf',
  color: '#fff',
  border: 'none',
  borderRadius: '50%',
  cursor: 'pointer',
  fontSize: '16px',
};

const newControlButtonStyle = {
  width: '40px',
  height: '40px',
  backgroundColor: '#007cbf',
  color: '#fff',
  border: 'none',
  borderRadius: '50%',
  cursor: 'pointer',
  fontSize: '18px',
};

export default Map;
