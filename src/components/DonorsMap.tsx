import React, { useState, useEffect, useCallback } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { locationService } from '../services/api';
import type { Donor, Hospital, BloodBank, BloodRequest, LocationData } from '../services/api';
import { Box, Typography, Paper, CircularProgress, Chip, ToggleButtonGroup, ToggleButton, Alert } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import ErrorIcon from '@mui/icons-material/Error';

// Fix for the default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// SVG paths for icons
const iconPaths = {
    person: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
    hospital: 'M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z',
    bloodtype: 'M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm3 16H9v-2h6v2zm0-5h-2v2h-2v-2H9v-2h2V9h2v2h2v2z',
    error: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'
};

// Custom marker icons
const createCustomIcon = (iconType: keyof typeof iconPaths, color: string) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="color: ${color}; transform: scale(1.5);">
            <svg viewBox="0 0 24 24" style="width: 24px; height: 24px;">
                <path fill="currentColor" d="${iconPaths[iconType]}"/>
            </svg>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
    });
};

const donorIcon = createCustomIcon('person', '#2196f3');
const hospitalIcon = createCustomIcon('hospital', '#4caf50');
const bloodBankIcon = createCustomIcon('bloodtype', '#f44336');
const requestIcon = createCustomIcon('error', '#ff9800');

interface MapLocation {
    latitude: number;
    longitude: number;
}

const DonorsMap = () => {
    const [userLocation, setUserLocation] = useState<MapLocation | null>(null);
    const [donors, setDonors] = useState<Donor[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
    const [bloodRequests, setBloodRequests] = useState<BloodRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [radius, setRadius] = useState(10000); // 10km in meters
    const [showDonors, setShowDonors] = useState(true);
    const [showHospitals, setShowHospitals] = useState(true);
    const [showBloodBanks, setShowBloodBanks] = useState(true);
    const [showRequests, setShowRequests] = useState(true);

    const fetchNearbyLocations = useCallback(async (location: MapLocation) => {
        setLoading(true);
        setError(null);
        try {
            const params: LocationData = {
                latitude: location.latitude,
                longitude: location.longitude,
                radius: radius / 1000 // Convert to kilometers
            };

            const [
                donorsRes,
                hospitalsRes,
                bloodBanksRes,
                requestsRes
            ] = await Promise.allSettled([
                locationService.getNearbyDonors(params),
                locationService.getNearbyHospitals(params),
                locationService.getNearbyBloodBanks(params),
                locationService.getNearbyRequests(params)
            ]);

            // Handle each response individually
            if (donorsRes.status === 'fulfilled') {
                setDonors(donorsRes.value as Donor[]);
            }
            if (hospitalsRes.status === 'fulfilled') {
                setHospitals(hospitalsRes.value as Hospital[]);
            }
            if (bloodBanksRes.status === 'fulfilled') {
                setBloodBanks(bloodBanksRes.value as BloodBank[]);
            }
            if (requestsRes.status === 'fulfilled') {
                setBloodRequests(requestsRes.value as BloodRequest[]);
            }

            // Check if any requests failed
            const errors = [donorsRes, hospitalsRes, bloodBanksRes, requestsRes]
                .filter(res => res.status === 'rejected')
                .map(res => (res as PromiseRejectedResult).reason?.message || 'Failed to fetch data');

            if (errors.length > 0) {
                setError(`Some data could not be loaded: ${errors.join(', ')}`);
            }
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch nearby locations');
        } finally {
            setLoading(false);
        }
    }, [radius]);

    useEffect(() => {
        // Get user's location
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location: MapLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                setUserLocation(location);
                fetchNearbyLocations(location);
            },
            (error) => {
                setError('Failed to get your location. Please enable location services.');
                setLoading(false);
            }
        );
    }, [fetchNearbyLocations]);

    const handleMarkersChange = (_event: React.MouseEvent<HTMLElement>, newMarkers: string[]) => {
        setShowDonors(newMarkers.includes('donors'));
        setShowHospitals(newMarkers.includes('hospitals'));
        setShowBloodBanks(newMarkers.includes('bloodBanks'));
        setShowRequests(newMarkers.includes('requests'));
    };

    if (!userLocation) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="warning">
                    Please enable location services to view the map
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ height: '100%' }}>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Nearby Blood Services
                </Typography>
                <ToggleButtonGroup
                    value={[
                        ...(showDonors ? ['donors'] : []),
                        ...(showHospitals ? ['hospitals'] : []),
                        ...(showBloodBanks ? ['bloodBanks'] : []),
                        ...(showRequests ? ['requests'] : [])
                    ]}
                    onChange={handleMarkersChange}
                    aria-label="map markers"
                >
                    <ToggleButton value="donors" aria-label="show donors">
                        <PersonIcon />
                        <Box sx={{ ml: 1 }}>Donors ({donors.length})</Box>
                    </ToggleButton>
                    <ToggleButton value="hospitals" aria-label="show hospitals">
                        <LocalHospitalIcon />
                        <Box sx={{ ml: 1 }}>Hospitals ({hospitals.length})</Box>
                    </ToggleButton>
                    <ToggleButton value="bloodBanks" aria-label="show blood banks">
                        <BloodtypeIcon />
                        <Box sx={{ ml: 1 }}>Blood Banks ({bloodBanks.length})</Box>
                    </ToggleButton>
                    <ToggleButton value="requests" aria-label="show requests">
                        <ErrorIcon />
                        <Box sx={{ ml: 1 }}>Requests ({bloodRequests.length})</Box>
                    </ToggleButton>
                </ToggleButtonGroup>

                {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                        <CircularProgress size={20} />
                        <Typography>Loading nearby locations...</Typography>
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}

                {!loading && !error && donors.length === 0 && hospitals.length === 0 && bloodBanks.length === 0 && bloodRequests.length === 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        No blood services found in your area. Try increasing the search radius or check back later.
                    </Alert>
                )}
            </Paper>

            <Box sx={{ height: '500px', width: '100%', position: 'relative' }}>
                <MapContainer
                    center={[userLocation.latitude, userLocation.longitude]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {/* User's location marker */}
                    <Marker position={[userLocation.latitude, userLocation.longitude]}>
                        <Popup>You are here</Popup>
                    </Marker>

                    {/* Render markers based on visibility settings */}
                    {showDonors && donors.map((donor) => (
                        <Marker
                            key={donor.id}
                            position={[donor.latitude, donor.longitude]}
                            icon={donorIcon}
                        >
                            <Popup>
                                <Typography variant="subtitle2">{donor.name}</Typography>
                                <Typography variant="body2">Blood Type: {donor.blood_type}</Typography>
                                {/* <Typography variant="body2">Distance: {(donor.distance / 1000).toFixed(1)} km</Typography> */}
                            </Popup>
                        </Marker>
                    ))}

                    {showHospitals && hospitals.map((hospital) => (
                        <Marker
                            key={hospital.id}
                            position={[hospital.latitude, hospital.longitude]}
                            icon={hospitalIcon}
                        >
                            <Popup>
                                <Typography variant="subtitle2">{hospital.name}</Typography>
                                <Typography variant="body2">{hospital.address}</Typography>
                                <Typography variant="body2">Phone: {hospital.contact_phone}</Typography>
                            </Popup>
                        </Marker>
                    ))}

                    {showBloodBanks && bloodBanks.map((bloodBank) => (
                        <Marker
                            key={bloodBank.id}
                            position={[bloodBank.latitude, bloodBank.longitude]}
                            icon={bloodBankIcon}
                        >
                            <Popup>
                                <Typography variant="subtitle2">{bloodBank.name}</Typography>
                                <Typography variant="body2">{bloodBank.address}</Typography>
                                <Typography variant="body2">Phone: {bloodBank.contact_phone}</Typography>
                                <Typography variant="body2">
                                    Available Blood Types: {bloodBank.available_blood_types.join(', ')}
                                </Typography>
                            </Popup>
                        </Marker>
                    ))}

                    {showRequests && bloodRequests.map((request) => (
                        <Marker
                            key={request.id}
                            position={[request.latitude, request.longitude]}
                            icon={requestIcon}
                        >
                            <Popup>
                                <Typography variant="subtitle2">Blood Request</Typography>
                                <Typography variant="body2">Blood Type: {request.blood_type}</Typography>
                                <Typography variant="body2">Units Needed: {request.units_needed}</Typography>
                                <Typography variant="body2">Urgency: {request.urgency_level}</Typography>
                                <Typography variant="body2">Hospital: {request.hospital_name}</Typography>
                                <Typography variant="body2">Contact: {request.contact_phone}</Typography>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </Box>
        </Box>
    );
};

export default DonorsMap; 