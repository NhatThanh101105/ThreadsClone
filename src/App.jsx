import { useEffect } from "react";
import { useDispatch } from "react-redux";
import AppRoutes from "@/routes/AppRoutes";
import { Toaster } from "@/components/ui/sonner";
import { fetchCurrentUser } from "@/store/slices/authSlice";

export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore user session on app start if token exists
    if (localStorage.getItem("access_token")) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <>
      <AppRoutes />
      <Toaster position="top-center" richColors />
    </>
  );
}
