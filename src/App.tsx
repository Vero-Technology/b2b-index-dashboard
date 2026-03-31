import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScraperDetail from './pages/ScraperDetail';
import Workers from './pages/Workers';
// DataBrowser removed — SourcesOverview handles all data browsing
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
import SECFilings from './pages/data/SECFilings';
import FDACRLs from './pages/data/FDACRLs';
import EMARefusals from './pages/data/EMARefusals';
import EUClinicalTrials from './pages/data/EUClinicalTrials';
import OTStudies from './pages/data/OTStudies';
import OTGenericBrowse from './pages/data/OTGenericBrowse';
import ChEMBLBrowse from './pages/data/ChEMBLBrowse';
import PharmGKBBrowse from './pages/data/PharmGKBBrowse';
import ClinVarBrowse from './pages/data/ClinVarBrowse';
import CIViCBrowse from './pages/data/CIViCBrowse';
import DisGeNETBrowse from './pages/data/DisGeNETBrowse';
import CrossRefExplorer from './pages/data/CrossRefExplorer';
import USPTOPatents from './pages/data/USPTOPatents';
import AACTBrowse from './pages/data/AACTBrowse';
import OTAssociationBrowse from './pages/data/OTAssociationBrowse';
import ICTRPBrowse from './pages/data/ICTRPBrowse';
import PurpleBookBrowse from './pages/data/PurpleBookBrowse';
import OrangeBookBrowse from './pages/data/OrangeBookBrowse';

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
              {/* /data/browser removed — SourcesOverview at /data handles everything */}
              <Route path="/data/conference-abstracts" element={<ConferenceAbstracts />} />
              <Route path="/data/fda-applications" element={<FDAApplications />} />
              <Route path="/data/fda-applications/:appNumber" element={<FDAApplicationDetail />} />
              <Route path="/data/fda-documents" element={<FDADocuments />} />
              <Route path="/data/ema-epars" element={<EMAEpars />} />
              <Route path="/data/adcom-documents" element={<AdComDocuments />} />
              <Route path="/data/adcom-members" element={<AdComMembers />} />
              <Route path="/data/clinical-trials" element={<ClinicalTrials />} />
              <Route path="/data/sec-filings" element={<SECFilings />} />
              <Route path="/data/fda-crls" element={<FDACRLs />} />
              <Route path="/data/ema-refusals" element={<EMARefusals />} />
              <Route path="/data/eu-clinical-trials" element={<EUClinicalTrials />} />
              <Route path="/data/ot-interactions" element={<OTGenericBrowse />} />
              <Route path="/data/ot-studies" element={<OTStudies />} />
              <Route path="/data/ot-literature" element={<OTGenericBrowse />} />
              <Route path="/data/ot-colocalisation" element={<OTGenericBrowse />} />
              <Route path="/data/ot-disease-phenotype" element={<OTGenericBrowse />} />
              <Route path="/data/ot-mouse-phenotype" element={<OTGenericBrowse />} />
              <Route path="/data/ot-pharmacogenomics" element={<OTGenericBrowse />} />
              <Route path="/data/ot-target-prioritisation" element={<OTGenericBrowse />} />
              <Route path="/data/chembl" element={<ChEMBLBrowse />} />
              <Route path="/data/pharmgkb" element={<PharmGKBBrowse />} />
              <Route path="/data/clinvar" element={<ClinVarBrowse />} />
              <Route path="/data/civic" element={<CIViCBrowse />} />
              <Route path="/data/disgenet" element={<DisGeNETBrowse />} />
              <Route path="/data/xref" element={<CrossRefExplorer />} />
              <Route path="/data/uspto-patents" element={<USPTOPatents />} />
              <Route path="/data/aact" element={<AACTBrowse />} />
              <Route path="/data/ot-associations" element={<OTAssociationBrowse />} />
              <Route path="/data/ictrp" element={<ICTRPBrowse />} />
              <Route path="/data/purple-book" element={<PurpleBookBrowse />} />
              <Route path="/data/orange-book" element={<OrangeBookBrowse />} />
              <Route path="/indexes" element={<Indexes />} />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}
