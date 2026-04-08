import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <nav className="flex items-center gap-6">
        <Link to="/" className="text-lg font-bold text-indigo-600">
          Hackathon Dashboard
        </Link>
        <Link to="/admin" className="text-gray-600 hover:text-indigo-600 transition-colors">
          Admin
        </Link>
        <Link to="/participant" className="text-gray-600 hover:text-indigo-600 transition-colors">
          Participant
        </Link>
      </nav>
    </header>
  );
}
