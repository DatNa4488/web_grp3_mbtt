'use client';

import React, { useState, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { JFinderDarkTheme } from './mapStyles';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 10.7769,
  lng: 106.7009
};

const libraries: ("places" | "visualization")[] = ["places", "visualization"];

// Mock Data Points
const LOCATIONS = [
  { id: 1, pos: { lat: 10.7769, lng: 106.7009 }, price: '$2,500', name: 'Bitexco Tower' },
  { id: 2, pos: { lat: 10.7721, lng: 106.6983 }, price: '$1,800', name: 'Ben Thanh Market Area' },
  { id: 3, pos: { lat: 10.7796, lng: 106.6990 }, price: '$1,500', name: 'Notre Dame Cathedral Zone' },
];

export default function JFinderMap() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selected, setSelected] = useState<any>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map: google.maps.Map) {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-cyan-500 animate-pulse">
        <div className="text-xl font-bold mb-2">JFinder Intelligence</div>
        <div className="text-sm text-gray-400">Loading Satellite Data...</div>
        {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-xs max-w-sm text-center">
            Warning: API Key not found. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full relative z-0">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: JFinderDarkTheme,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
        }}
      >
        {/* Heatmap Layer would go here if we had the visualization library data format ready */}

        {LOCATIONS.map(loc => (
          <Marker
            key={loc.id}
            position={loc.pos}
            onClick={() => setSelected(loc)}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' // Use custom SVG later
            }}
          />
        ))}

        {selected && (
          <InfoWindow
            position={selected.pos}
            onCloseClick={() => setSelected(null)}
          >
            <div className="p-2 min-w-[150px]">
              <h3 className="font-bold text-black">{selected.name}</h3>
              <p className="text-blue-600 font-bold">{selected.price}<span className="text-xs font-normal text-gray-500">/mo</span></p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Overlay Tech Elements */}
      <div className="absolute inset-0 pointer-events-none border-[1px] border-cyan-500/10 z-10"></div>
      <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-cyan-500 z-10"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-cyan-500 z-10"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-cyan-500 z-10"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-cyan-500 z-10"></div>
    </div>
  );
}
