import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Profile from "./components/Profile";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth0();
  return isAuthenticated ? children : <Navigate to="/" />;
};

// App component containing the router
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            // <ProtectedRoute>
            <Home />
            // </ProtectedRoute>
          }
        />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
