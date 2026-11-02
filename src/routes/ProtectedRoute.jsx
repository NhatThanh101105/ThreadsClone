import { Navigate, Outlet, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute() {
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <Loader2 className="animate-spin text-[var(--muted-foreground)]" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
