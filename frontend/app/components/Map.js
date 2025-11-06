import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Legend from "./Legend";
import { SearchInput, SearchResult } from "@leafygreen-ui/search-input";
import styles from "../styles/map.module.css";
import Pin from "@leafygreen-ui/icon/dist/Pin";
import IconButton from "@leafygreen-ui/icon-button";
import { useMarkers } from "../context/Markers";
import GeocodingAPIClient from "@/clients/geocoding-api-client";

const icons = {
  selected: L.icon({
    iconUrl: "/gray.png",
    iconSize: [23, 40],
    shadowSize: [23, 40],
    iconAnchor: [11, 20],
  }),
  2016: L.icon({
    iconUrl: "/blue.png",
    iconSize: [23, 40],
    shadowSize: [23, 40],
    iconAnchor: [11, 20],
  }),
  2017: L.icon({
    iconUrl: "/green.png",
    iconSize: [23, 40],
    shadowSize: [23, 40],
    iconAnchor: [11, 20],
  }),
  2018: L.icon({
    iconUrl: "/yellow.png",
    iconSize: [23, 40],
    shadowSize: [23, 40],
    iconAnchor: [11, 20],
  }),
  2019: L.icon({
    iconUrl: "/orange.png",
    iconSize: [23, 40],
    shadowSize: [23, 40],
    iconAnchor: [11, 20],
  }),
  2020: L.icon({
    iconUrl: "/red.png",
    iconSize: [23, 40],
    shadowSize: [23, 40],
    iconAnchor: [11, 20],
  }),
};

const Map = ({ coordinates }) => {
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [zoom, setZoom] = useState(4);
  const [showMarkers, setShowMarkers] = useState(false);
  const [position, setPosition] = useState(null);
  const { markers, setMarkers } = useMarkers();
  const { address, setAddress } = useMarkers();
  const { llmResponse } = useMarkers();

  const handleMapClick = async (coords) => {
    setSelectedCoords(coords);
    setShowMarkers(false);
    try {
      const data = await GeocodingAPIClient.getCoordinates({
        latitude: coords.lat,
        longitude: coords.lng,
      });
      setMarkers(data);
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
  };

  useEffect(() => {
    if (coordinates) {
      setPosition(coordinates);
      handleMapClick(coordinates);
      setZoom(18);
    }
  }, [coordinates]);

  const handleButtonClick = () => {
    setShowMarkers((prevShowMarkers) => !prevShowMarkers);
    setZoom((prevZoom) => (prevZoom === 11 ? 18 : 11));
  };

  const fetchCoordinates = async (address) => {
    try {
      const data = await GeocodingAPIClient.geocodeAddress({ address });
      //console.log('fetchCoordinates:', data[0]);
      return { lat: data[0].latitude, lng: data[0].longitude };
    } catch (error) {
      console.error("Error fetching coordinates:", error);
    }
  };

  const MapEvents = () => {
    const map = useMapEvents({
      click: (e) => {
        setPosition(e.latlng);
        handleMapClick(e.latlng);
        setZoom(18);

        map.once("moveend", () => {
          GeocodingAPIClient.reverseGeocode({
            latitude: e.latlng.lat,
            longitude: e.latlng.lng,
          })
            .then((data) => {
              setAddress(data.address);
            })
            .catch((error) => console.error("Error:", error));
        });
      },
    });

    useEffect(() => {
      if (position) {
        map.flyTo(position, zoom, {
          animate: true,
          duration: 0.5,
        });
      }
    }, [zoom, position]);

    return null;
  };

  const bounds = [
    [24.396308, -125.0],
    [49.384358, -66.93457],
  ];

  const Headquarters =
    "1634 Broadway 1st floor, New York, NY 10019, United States";
  const Cali = "88 Kearny St Suite 500, San Francisco, CA 94108, United States";
  const Texas = "201 Lily Trail, Red Oak, TX 75154, USA";

  return (
    <div className={styles.mapContainer}>
      <div className={styles.searchBar}>
        <SearchInput
          className={styles.searchInput}
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              fetchCoordinates(address).then((coords) => {
                if (coords) {
                  setPosition(coords);
                  handleMapClick(coords);
                  setZoom(18);
                }
              });
            }
          }}
        >
          <SearchResult
            description="Leafy tower"
            onClick={() => {
              fetchCoordinates(Headquarters).then((coords) => {
                if (coords) {
                  setPosition(coords);
                  handleMapClick(coords);
                  setZoom(18);
                  setAddress(Headquarters);
                }
              });
            }}
          >
            {Headquarters}
          </SearchResult>
          <SearchResult
            description="Leafy California office"
            onClick={() => {
              fetchCoordinates(Cali).then((coords) => {
                if (coords) {
                  setPosition(coords);
                  handleMapClick(coords);
                  setZoom(18);
                  setAddress(Cali);
                }
              });
            }}
          >
            {Cali}
          </SearchResult>
          <SearchResult
            description="Leafy Texas office"
            onClick={() => {
              fetchCoordinates(Texas).then((coords) => {
                if (coords) {
                  setPosition(coords);
                  handleMapClick(coords);
                  setZoom(18);
                  setAddress(Texas);
                }
              });
            }}
          >
            {Texas}
          </SearchResult>
        </SearchInput>
        {llmResponse !== "" && (
          <IconButton
            className={styles.iconButton}
            onClick={handleButtonClick}
            aria-label="Some Menu"
          >
            <Pin />
          </IconButton>
        )}
      </div>
      <div className={styles.mapBox}>
        <MapContainer
          center={[37.8, -96]}
          zoom={zoom}
          style={{
            height: "100%",
            width: "100%",
            minHeight: "350px",
            minWidth: "350px",
            zIndex: "1",
          }}
          maxBounds={bounds}
          minZoom={4}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution={
              selectedCoords
                ? `Selected Coordinates: ${selectedCoords.lat}, ${selectedCoords.lng}`
                : ""
            }
          />
          <MapEvents />
          {position !== null && (
            <Marker position={position} icon={icons.selected} />
          )}
          {showMarkers &&
            markers &&
            position &&
            markers
              .slice(1)
              .map((item, index) => (
                <Circle center={position} radius={5000} fillOpacity={0.02} />
              ))}
          {showMarkers &&
            markers &&
            position &&
            markers
              .slice(1)
              .map((item, index) => (
                <Marker
                  key={index}
                  position={[item.latitude, item.longitude]}
                  icon={icons[item.year]}
                />
              ))}
        </MapContainer>
        <div className={styles.solution}>{showMarkers && <Legend />}</div>
      </div>
    </div>
  );
};

export default Map;
