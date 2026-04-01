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
import ClinicalTrials from './pages/data/ClinicalTrials';
import UniProt from './pages/data/UniProt';
import Reactome from './pages/data/Reactome';
import StringPPI from './pages/data/StringPPI';
import HPATissue from './pages/data/HPATissue';
import HPARna from './pages/data/HPARna';
import AlphaFold from './pages/data/AlphaFold';

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
              <Route path="/data/clinical-trials" element={<ClinicalTrials />} />
              <Route path="/data/uniprot" element={<UniProt />} />
              <Route path="/data/reactome" element={<Reactome />} />
              <Route path="/data/string-ppi" element={<StringPPI />} />
              <Route path="/data/hpa-tissue" element={<HPATissue />} />
              <Route path="/data/hpa-rna" element={<HPARna />} />
              <Route path="/data/alphafold" element={<AlphaFold />} />
              <Route path="/indexes" element={<Indexes />} />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
