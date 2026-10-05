import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import DispatcherDashboard from "./pages/dispatcher/DispatcherDashboard";
import DriverView from "./pages/Driver/DriverView";
import StoreManagerView from "./pages/store-manager/StoreManagerView";
import LoaderView from "./pages/loader/LoaderView";
import Login from "./pages/auth/Login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dispatcher" element={<DispatcherDashboard />} />
        <Route path="/driver" element={<DriverView />} />
        <Route path="/store-manager" element={<StoreManagerView />} />
        <Route path="/loader" element={<LoaderView />} />
      </Routes>
    </Router>
  );
}

export default App;
