declare namespace google {
    namespace maps {
        class Map {
            constructor(mapDiv: Element | null, opts?: MapOptions);
        }
        class Marker {
            constructor(opts?: MarkerOptions);
        }
        interface MapOptions {
            center?: LatLng | LatLngLiteral;
            zoom?: number;
            [key: string]: any;
        }
        interface MarkerOptions {
            position?: LatLng | LatLngLiteral;
            map?: Map;
            [key: string]: any;
        }
        interface LatLng {
            lat(): number;
            lng(): number;
        }
        interface LatLngLiteral {
            lat: number;
            lng: number;
        }
    }
}
