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
import SourcesOverview from './pages/data/SourcesOverview';
import SourceDetail from './pages/data/SourceDetail';
import ConferenceAbstracts from './pages/data/ConferenceAbstracts';
import FDAApplications from './pages/data/FDAApplications';
import FDAApplicationDetail from './pages/data/FDAApplicationDetail';
import FDADocuments from './pages/data/FDADocuments';
import EMAEpars from './pages/data/EMAEpars';
import AdComDocuments from './pages/data/AdComDocuments';
import AdComMembers from './pages/data/AdComMembers';

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
              <Route path="/data" element={<SourcesOverview />} />
              <Route path="/data/source/:source" element={<SourceDetail />} />
              <Route path="/data/browser" element={<DataBrowser />} />
              <Route path="/data/conference-abstracts" element={<ConferenceAbstracts />} />
              <Route path="/data/fda-applications" element={<FDAApplications />} />
              <Route path="/data/fda-applications/:appNumber" element={<FDAApplicationDetail />} />
              <Route path="/data/fda-documents" element={<FDADocuments />} />
              <Route path="/data/ema-epars" element={<EMAEpars />} />
              <Route path="/data/adcom-documents" element={<AdComDocuments />} />
              <Route path="/data/adcom-members" element={<AdComMembers />} />
              <Route path="/indexes" element={<Indexes />} />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
