import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Incident } from '../types';

interface LeafletMapProps {
  incidents?: Incident[];
  selectedIncident?: Incident | null;
  volunteerLocation?: { lat: number; lng: number; name?: string } | null;
  height?: string;
  zoom?: number;
  center?: [number, number];
  showRoute?: boolean;
}

// Fix standard Leaflet default icon path issues in bundled environments
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const emergencyIcon = L.divIcon({
  className: 'custom-emergency-pin',
  html: `
    <div style="background-color: #ef4444; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; position: relative;">
      🚨
      <span style="position: absolute; inset: -4px; border-radius: 50%; border: 2px solid #ef4444; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.75;"></span>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

const resolvedIcon = L.divIcon({
  className: 'custom-resolved-pin',
  html: `
    <div style="background-color: #10b981; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 3px 8px rgba(16, 185, 129, 0.4); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
      ✅
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

const volunteerIcon = L.divIcon({
  className: 'custom-volunteer-pin',
  html: `
    <div style="background-color: #2563eb; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
      🚶
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

export const LeafletMap: React.FC<LeafletMapProps> = ({
  incidents = [],
  selectedIncident,
  volunteerLocation,
  height = '400px',
  zoom = 13,
  center = [21.1458, 79.0882],
  showRoute = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        scrollWheelZoom: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | SANKALP 2026-2027',
        maxZoom: 19
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, []);

  // Update Markers & Overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    // 1. Render all passed incidents
    const itemsToRender = selectedIncident ? [selectedIncident] : incidents;

    itemsToRender.forEach(inc => {
      if (!inc.latitude || !inc.longitude) return;

      const markerIcon = inc.status === 'RESOLVED' ? resolvedIcon : emergencyIcon;
      const marker = L.marker([inc.latitude, inc.longitude], { icon: markerIcon });

      const popupContent = `
        <div style="font-family: sans-serif; min-width: 200px; padding: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-weight: 700; color: #1e293b; font-size: 13px;">${inc.id}</span>
            <span style="background: ${inc.priority === 'CRITICAL' ? '#fee2e2' : inc.priority === 'HIGH' ? '#ffedd5' : '#f1f5f9'}; color: ${inc.priority === 'CRITICAL' ? '#991b1b' : inc.priority === 'HIGH' ? '#9a3412' : '#334155'}; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600;">${inc.priority}</span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${inc.title}</h4>
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">${inc.category} &bull; ${inc.affectedPeople} affected</p>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            <strong>Status:</strong> <span style="font-weight: 600; color: ${inc.status === 'RESOLVED' ? '#16a34a' : '#ea580c'}">${inc.status.replace(/_/g, ' ')}</span>
          </div>
          <div style="font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px;">
            📍 ${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.addTo(layerGroup);
      bounds.push([inc.latitude, inc.longitude]);
    });

    // 2. Render Volunteer marker if present
    if (volunteerLocation) {
      const volMarker = L.marker([volunteerLocation.lat, volunteerLocation.lng], { icon: volunteerIcon });
      volMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #1e40af; font-size: 13px;">Volunteer: ${volunteerLocation.name || 'Active Volunteer'}</strong>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">📍 Current Position: ${volunteerLocation.lat.toFixed(4)}, ${volunteerLocation.lng.toFixed(4)}</p>
        </div>
      `);
      volMarker.addTo(layerGroup);
      bounds.push([volunteerLocation.lat, volunteerLocation.lng]);

      // 3. Draw Route / Line between Volunteer and Emergency
      if (showRoute && selectedIncident && selectedIncident.latitude && selectedIncident.longitude) {
        const polyline = L.polyline(
          [
            [volunteerLocation.lat, volunteerLocation.lng],
            [selectedIncident.latitude, selectedIncident.longitude]
          ],
          {
            color: '#3b82f6',
            weight: 4,
            dashArray: '8, 8',
            opacity: 0.8
          }
        );
        polyline.addTo(layerGroup);

        // Distance marker in middle
        const midLat = (volunteerLocation.lat + selectedIncident.latitude) / 2;
        const midLng = (volunteerLocation.lng + selectedIncident.longitude) / 2;
        
        // Calculate rough distance in km (Haversine)
        const R = 6371; // km
        const dLat = ((selectedIncident.latitude - volunteerLocation.lat) * Math.PI) / 180;
        const dLng = ((selectedIncident.longitude - volunteerLocation.lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((volunteerLocation.lat * Math.PI) / 180) *
            Math.cos((selectedIncident.latitude * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = (R * c).toFixed(2);

        const distanceTooltip = L.tooltip({
          permanent: true,
          direction: 'center',
          className: 'route-distance-badge'
        })
          .setContent(`🚗 Distance: ~${distanceKm} km`)
          .setLatLng([midLat, midLng]);

        distanceTooltip.addTo(layerGroup);
      }
    }

    // Auto-fit bounds if multiple points exist
    if (bounds.length === 1) {
      map.setView(bounds[0], zoom);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [40, 40], maxZoom: 16 });
    }
  }, [incidents, selectedIncident, volunteerLocation, showRoute, zoom]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
      <div id="leaflet-map-container" ref={mapContainerRef} style={{ height, width: '100%' }} />
      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] font-medium text-slate-600 shadow-xs border border-slate-200">
        OpenStreetMap &bull; Leaflet.js
      </div>
    </div>
  );
};
