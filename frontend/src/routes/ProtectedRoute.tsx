import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";

function ProtectedRoute() {
  const token = useAppStore((s) => s.token);
  const loadFromStorage = useAppStore((s) => s.loadFromStorage);

  useEffect(() => {
    if (!token) {
      loadFromStorage();
    }
  }, [token, loadFromStorage]);

  if (!token && !localStorage.getItem("tm_token")) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

