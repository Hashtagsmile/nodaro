import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { AppProvider } from "@/context/AppContext";
import { App } from "@/App";
import "./index.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <AppProvider>
      <App />
      <Toaster
        theme="dark"
        position="bottom-right"
        closeButton
        toastOptions={{
          classNames: {
            toast:
              "group border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-lg",
            description: "text-zinc-400",
            actionButton: "bg-zinc-800",
            cancelButton: "bg-zinc-800",
          },
        }}
      />
    </AppProvider>
  </StrictMode>,
);
