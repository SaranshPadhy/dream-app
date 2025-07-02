import { Outlet, Link } from "react-router-dom";
import '../styles/layout.css';

export default function Layout() {
  return (
    <>
      <header className="app-header">
        <div className="header-container">
          <h1 className="app-title">Dream Tracker</h1>
          <nav className="main-nav">
            <Link to="/" className="nav-link">Calendar</Link>
            <Link to="/dreams/new" className="nav-link add-dream">+ Add Dream</Link>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
}
