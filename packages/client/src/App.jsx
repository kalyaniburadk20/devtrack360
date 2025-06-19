import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Assuming default Vite App.css

const API_URL = 'http://localhost:3001/api'; // Your backend API base URL

function App() {
  const [token, setToken] = useState(localStorage.getItem('devtrack360_token'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');

  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);

  const handleAuth = async (endpoint) => {
    try {
      const res = await axios.post(`${API_URL}/auth/${endpoint}`, { username, password });
      setMessage(res.data.message);
      if (res.data.token) {
        setToken(res.data.token);
        localStorage.setItem('devtrack360_token', res.data.token);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || 'An error occurred.');
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('devtrack360_token');
    setProjects([]);
    setMessage('Logged out successfully.');
  };

  const fetchProjects = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data.projects);
      setMessage('Projects fetched successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error fetching projects.');
      if (err.response?.status === 403) {
        handleLogout(); // Log out if token is invalid/expired
      }
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/projects`, { name: projectName, description: projectDescription }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage(res.data.message);
      setProjectName('');
      setProjectDescription('');
      fetchProjects(); // Refresh project list
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error creating project.');
    }
  };

  return (
    <div className="App">
      <h1>DevTrack360</h1>
      <p>{message}</p>

      {!token ? (
        <div>
          <h2>Authentication</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={() => handleAuth('register')}>Register</button>
          <button onClick={() => handleAuth('login')}>Login</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {username || 'User'}!</h2> {/* Replace with actual username from decoded token if needed */}
          <button onClick={handleLogout}>Logout</button>

          <h3>Create New Project</h3>
          <form onSubmit={handleCreateProject}>
            <input
              type="text"
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
            <textarea
              placeholder="Project Description (optional)"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
            ></textarea>
            <button type="submit">Create Project</button>
          </form>

          <h3>Your Projects</h3>
          {projects.length === 0 ? (
            <p>No projects yet. Create one!</p>
          ) : (
            <ul>
              {projects.map((project) => (
                <li key={project.id}>
                  <strong>{project.name}</strong>: {project.description} (Created: {new Date(project.created_at).toLocaleDateString()})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
