import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as api from "../services/api";

interface AppState {
  isConnected: boolean;
  mongoUri: string;
  dbName: string;
  selectedCollection: string | null;
  isConnecting: boolean;
  connectionError: string | null;
  connect: (uri: string) => Promise<void>;
  disconnect: () => void;
  selectCollection: (name: string | null) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [mongoUri, setMongoUri] = useState("");
  const [dbName, setDbName] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null,
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connect = useCallback(async (uri: string) => {
    setIsConnecting(true);
    setConnectionError(null);
    try {
      await api.connect(uri);
      const status = await api.getConnectionStatus();
      setMongoUri(uri);
      setDbName(status.name ?? "");
      setIsConnected(true);
      setSelectedCollection(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Connection failed";
      setConnectionError(message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setMongoUri("");
    setDbName("");
    setSelectedCollection(null);
    setConnectionError(null);
  }, []);

  const selectCollection = useCallback((name: string | null) => {
    setSelectedCollection(name);
  }, []);

  // On first load, detect whether backend already has an active Mongo connection
  // (e.g. started with MONGO_URI in embed/CLI mode).
  useEffect(() => {
    const bootstrapConnection = async () => {
      try {
        const status = await api.getConnectionStatus();
        if (status.connected) {
          setIsConnected(true);
          setDbName(status.name ?? "");
        }
      } catch {
        // Ignore bootstrap errors; user can still connect manually.
      }
    };

    void bootstrapConnection();
  }, []);

  return (
    <AppContext.Provider
      value={{
        isConnected,
        mongoUri,
        dbName,
        selectedCollection,
        isConnecting,
        connectionError,
        connect,
        disconnect,
        selectCollection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
