import * as Location from "expo-location";
import React, { createContext, useContext, useState } from "react";

interface LocationContextType {
  locationEnabled: boolean;
  coords: Location.LocationObjectCoords | null;
  toggleLocation: (value: boolean) => Promise<void>;
}

const LocationContext = createContext<LocationContextType>(
  {} as LocationContextType,
);

export const LocationProvider = ({ children }: any) => {
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(
    null,
  );

  const toggleLocation = async (value: boolean) => {
    if (value) {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        alert("Location permission denied");
        return;
      }

      const userLocation = await Location.getCurrentPositionAsync({});
      setCoords(userLocation.coords);
      setLocationEnabled(true);
    } else {
      setLocationEnabled(false);
      setCoords(null);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        locationEnabled,
        coords,
        toggleLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
