import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./pages/Auth";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/Auth";

const router = createBrowserRouter([
  {path: '/', element: <HomePage />},
  {path: '/auth', element: <AuthPage />}
])

export default function App() {
  return (
    <RouterProvider router={router} />
  );
}
