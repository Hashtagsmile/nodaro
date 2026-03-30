import { useApp } from "@/context/AppContext";
import { ConnectionPanel } from "@/components/ConnectionPanel";
import { Dashboard } from "@/pages/Dashboard";

export function App() {
  const { isConnected } = useApp();
  return isConnected ? <Dashboard /> : <ConnectionPanel />;
}
