import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { TripProvider } from './context/TripContext'
import { AddEntryPage } from './pages/AddEntryPage'
import { HomePage } from './pages/HomePage'
import { MemoryDetailPage } from './pages/MemoryDetailPage'
import { NewTripPage } from './pages/NewTripPage'
import { TripPage } from './pages/TripPage'

export default function App() {
  return (
    <TripProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trips/new" element={<NewTripPage />} />
          <Route path="/trips/:tripId" element={<TripPage />} />
          <Route path="/trips/:tripId/add" element={<AddEntryPage />} />
          <Route path="/trips/:tripId/memories/:entryId" element={<MemoryDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TripProvider>
  )
}
