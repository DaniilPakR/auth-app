import { Outlet } from "react-router-dom";

import ErrorPanel from "../components/ErrorPanel";
import StatusPanel from "../components/StatusPanel";

export default function RootPage() {
  return (
    <>
      <StatusPanel />
      <ErrorPanel />
      <Outlet />
    </>
  )
}