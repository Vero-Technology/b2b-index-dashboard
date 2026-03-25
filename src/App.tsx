import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScraperDetail from './pages/ScraperDetail';
import Workers from './pages/Workers';
import DataBrowser from './pages/DataBrowser';
import Indexes from './pages/Indexes';
import SystemMonitor from './pages/SystemMonitor';
import WorkerLaunch from './pages/WorkerLaunch';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AuthGuard />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/scrapers/:source" element={<ScraperDetail />} />
              <Route path="/system" element={<SystemMonitor />} />
              <Route path="/launch" element={<WorkerLaunch />} />
              <Route path="/workers" element={<Workers />} />
              <Route path="/data" element={<DataBrowser />} />
              <Route path="/indexes" element={<Indexes />} />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
