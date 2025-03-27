"use client";

import { createContext, useState, useContext } from "react";

const MarkersContext = createContext();

export function MarkersProvider({ children }) {
  const [markers, setMarkers] = useState([]);
  const [address, setAddress] = useState("");
  const [llmResponse, setLlmResponse] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <MarkersContext.Provider
      value={{
        markers,
        setMarkers,
        address,
        setAddress,
        llmResponse,
        setLlmResponse,
        loading,
        setLoading,
      }}
    >
      {children}
    </MarkersContext.Provider>
  );
}

export function useMarkers() {
  console.log(MarkersContext);
  const context = useContext(MarkersContext);
  if (!context) {
    throw new Error("useMarkers must be used within a MarkersProvider");
  }
  return context;
}
