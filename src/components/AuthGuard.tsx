import { Navigate, Outlet } from 'react-router-dom';

export function AuthGuard() {
  const apiKey = localStorage.getItem('scrape_api_key');

  if (!apiKey) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
