import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";

import { AuthProvider } from "./context/AuthProvider.tsx";
import { Toaster } from "./components/ui/toaster.tsx";
import { subscribeToPushNotifications } from "./lib/push.ts";

if ("serviceWorker" in navigator){
  navigator.serviceWorker.register('/sw.js')
}
if ("Notification" in window && navigator.serviceWorker) {
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification permission granted.");
      subscribeToPushNotifications();
    } else {
      console.log("Notification permission denied.");
    }
  });
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
