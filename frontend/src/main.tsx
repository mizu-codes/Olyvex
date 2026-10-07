import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { BrowserRouter } from "react-router";
import { setupApiInterceptors } from "./api/client";
import { Notifications } from "@/components/ui/notifications";
setupApiInterceptors(store);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Notifications />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
