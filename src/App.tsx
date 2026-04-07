import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Header from './components/layout/Header';
import AdminPage from './pages/admin';
import ParticipantPage from './pages/participant';

function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="bg-white rounded-xl shadow p-10 text-center max-w-md w-full">
        <h1 className="text-4xl font-bold text-indigo-600 mb-2">Hackathon Dashboard</h1>
        <p className="text-gray-500 mb-8">React + TypeScript + Vite + Tailwind CSS</p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/admin"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Admin
          </Link>
          <Link
            to="/participant"
            className="px-6 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Participant
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/participant" element={<ParticipantPage />} />
      </Routes>
    </BrowserRouter>
  );
}
