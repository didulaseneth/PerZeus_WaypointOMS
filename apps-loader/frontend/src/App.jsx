import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoaderProvider } from './store/LoaderStore'
import LoaderLogin from './pages/loader/LoaderLogin'
import LoadingManifest from './pages/loader/LoadingManifest'
import RunDetail from './pages/loader/RunDetail'
import StopSequence from './pages/loader/StopSequence'
import ItemScan from './pages/loader/ItemScan'
import ItemDetail from './pages/loader/ItemDetail'
import FlagItem from './pages/loader/FlagItem'
import Exceptions from './pages/loader/Exceptions'
import SignOff from './pages/loader/SignOff'
import Success from './pages/loader/Success'
import OfflineSync from './pages/loader/OfflineSync'
import MultiToast from './pages/loader/MultiToast'
import SyncFailed from './pages/loader/SyncFailed'
import EmptyState from './pages/loader/EmptyState'
import ShiftCleared from './pages/loader/ShiftCleared'
import ScanFailed from './pages/loader/ScanFailed'
import Inbox from './pages/loader/Inbox'
import RouteChanged from './pages/loader/RouteChanged'
import RunLocked from './pages/loader/RunLocked'
import Profile from './pages/loader/Profile'
import ShiftHandover from './pages/loader/ShiftHandover'
import HandoverConfirm from './pages/loader/HandoverConfirm'
import Summary from './pages/loader/Summary'

function RootRedirect() {
  const search = typeof window !== 'undefined' ? window.location.search : ''
  return <Navigate to={`/loader/login${search}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <LoaderProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/loader/login" element={<LoaderLogin />} />

          <Route path="/loader/manifest/:runId"         element={<LoadingManifest />} />
          <Route path="/loader/run/:runId"              element={<RunDetail />} />
          <Route path="/loader/run/:runId/locked"       element={<RunLocked />} />
          <Route path="/loader/run/:runId/stops"        element={<StopSequence />} />
          <Route path="/loader/run/:runId/stop/:stopId" element={<ItemScan />} />
          <Route path="/loader/run/:runId/stop/:stopId/detail" element={<ItemDetail />} />
          <Route path="/loader/run/:runId/flag/:stopId" element={<FlagItem />} />
          <Route path="/loader/run/:runId/exceptions"   element={<Exceptions />} />
          <Route path="/loader/run/:runId/signoff"      element={<SignOff />} />
          <Route path="/loader/run/:runId/success"      element={<Success />} />
          <Route path="/loader/run/:runId/offline"      element={<OfflineSync />} />
          <Route path="/loader/run/:runId/scan-failed"  element={<ScanFailed />} />

          <Route path="/loader/multitoast"   element={<MultiToast />} />
          <Route path="/loader/sync-failed"  element={<SyncFailed />} />
          <Route path="/loader/empty"        element={<EmptyState />} />
          <Route path="/loader/shift-cleared" element={<ShiftCleared />} />

          <Route path="/loader/inbox"          element={<Inbox />} />
          <Route path="/loader/route-changed"  element={<RouteChanged />} />
          <Route path="/loader/profile"        element={<Profile />} />

          <Route path="/loader/handover"         element={<ShiftHandover />} />
          <Route path="/loader/handover/confirm" element={<HandoverConfirm />} />
          <Route path="/loader/summary" element={<Summary />} />
        </Routes>
      </LoaderProvider>
    </BrowserRouter>
  )
}