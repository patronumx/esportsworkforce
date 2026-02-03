import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';

import Welcome from './pages/Welcome';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-white font-sans">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login title="Workforce Portal" expectedRole="Worker" />} />
          <Route path="/admin-login" element={<Login title="Admin Portal" expectedRole="Admin" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/worker-dashboard" element={<WorkerDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
