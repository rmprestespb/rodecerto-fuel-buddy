import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Crown, Lock, Navigation, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const gasStationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2933/2933893.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

// Mock gas stations (in real app, would come from API)
const mockStations = [
  { id: 1, name: 'Posto Shell Centro', lat: -23.5505, lng: -46.6333, distance: 0.3 },
  { id: 2, name: 'Posto Ipiranga', lat: -23.5520, lng: -46.6350, distance: 0.5 },
  { id: 3, name: 'Posto BR', lat: -23.5490, lng: -46.6310, distance: 0.8 },
  { id: 4, name: 'Posto Petrobras', lat: -23.5530, lng: -46.6380, distance: 1.2 },
];

function LocationMarker() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate().on('locationfound', (e) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
      map.flyTo(e.latlng, 15);
    });
  }, [map]);

  return position ? (
    <Marker position={position} icon={userIcon}>
      <Popup>
        <div className="text-center">
          <p className="font-semibold">Você está aqui</p>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

export default function Map() {
  const navigate = useNavigate();
  const { user, profile, canUseMap, incrementMapUses, loading: authLoading } = useAuth();
  const [mapAccessed, setMapAccessed] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleAccessMap = async () => {
    if (profile?.is_pro) {
      setMapAccessed(true);
      return;
    }

    if (canUseMap()) {
      const success = await incrementMapUses();
      if (success) {
        setMapAccessed(true);
      }
    } else {
      setShowUpgradeModal(true);
    }
  };

  const openInMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
    window.open(url, '_blank');
  };

  const remainingUses = profile ? Math.max(0, 2 - profile.map_uses_count) : 0;

  if (!mapAccessed) {
    return (
      <AppLayout>
        <div className="p-6 flex flex-col items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-primary flex items-center justify-center glow-primary">
              <MapPin size={40} className="text-primary-foreground" />
            </div>

            <h1 className="text-2xl font-bold mb-3">Mapa de Postos</h1>
            <p className="text-muted-foreground mb-6">
              Encontre postos de combustível próximos à sua localização e trace rotas direto pelo mapa.
            </p>

            {profile?.is_pro ? (
              <Button onClick={handleAccessMap} className="bg-gradient-primary glow-primary gap-2">
                <Navigation size={18} />
                Abrir Mapa
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-primary/30 bg-primary/10">
                  <p className="text-sm font-medium text-primary">
                    {remainingUses > 0 
                      ? `Você tem ${remainingUses} uso${remainingUses > 1 ? 's' : ''} gratuito${remainingUses > 1 ? 's' : ''}`
                      : 'Você usou todos os seus usos gratuitos'}
                  </p>
                </div>

                {remainingUses > 0 ? (
                  <Button onClick={handleAccessMap} className="w-full bg-gradient-primary glow-primary gap-2">
                    <Navigation size={18} />
                    Usar mapa ({remainingUses} restante{remainingUses > 1 ? 's' : ''})
                  </Button>
                ) : (
                  <Button onClick={() => navigate('/upgrade')} className="w-full bg-gradient-primary glow-primary gap-2">
                    <Crown size={18} />
                    Fazer upgrade para Pro
                  </Button>
                )}

                <p className="text-xs text-muted-foreground">
                  Usuários Pro têm acesso ilimitado ao mapa
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-100px)] relative">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="text-primary" size={20} />
                <h1 className="font-semibold">Postos Próximos</h1>
              </div>
              {!profile?.is_pro && (
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                  {remainingUses} uso{remainingUses !== 1 ? 's' : ''} restante{remainingUses !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        <MapContainer
          center={[-23.5505, -46.6333]}
          zoom={13}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
          
          {mockStations.map((station) => (
            <Marker
              key={station.id}
              position={[station.lat, station.lng]}
              icon={gasStationIcon}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <h3 className="font-semibold text-foreground">{station.name}</h3>
                  <p className="text-sm text-muted-foreground">{station.distance} km de distância</p>
                  <Button
                    size="sm"
                    className="w-full mt-2 gap-1"
                    onClick={() => openInMaps(station.lat, station.lng, station.name)}
                  >
                    <ExternalLink size={14} />
                    Traçar rota
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Stations List */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <div className="glass rounded-2xl p-4 max-h-48 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-2">{mockStations.length} postos encontrados</p>
            <div className="space-y-2">
              {mockStations.map((station) => (
                <motion.div
                  key={station.id}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-between p-2 rounded-xl bg-muted/50 cursor-pointer hover:bg-muted"
                  onClick={() => openInMaps(station.lat, station.lng, station.name)}
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-primary" />
                    <span className="text-sm font-medium">{station.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{station.distance} km</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
