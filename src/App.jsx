import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import { action as authAction } from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },
  { path: "/auth", element: <AuthPage />, action: authAction },
  { path: "/admin", element: <AdminPage /> }
]);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
