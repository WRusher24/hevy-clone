import { Button } from "@chakra-ui/react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Pages from "./Pages.json";
import { useApp } from "./context/AppContext";
import { config } from "./config";
import "./styles/app.css";

export interface NavItem {
  key: number;
  pageName: string;
  displayName: string;
}

const NAV_ITEMS = Pages as NavItem[];

export default function NavBar() {
  const { activeWorkout, startEmptyWorkout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleStart = () => {
    if (!activeWorkout) startEmptyWorkout();
    navigate("/workout");
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <NavLink to="/" className="brand" aria-label={`${config.appName} home`}>
          <span className="brand-mark">HC</span>
          <span className="brand-name">{config.appName}</span>
        </NavLink>

        <nav className="nav-links" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.pageName === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.pageName);
            return (
              <NavLink
                key={item.key}
                to={item.pageName}
                className={`nav-link${isActive ? " is-active" : ""}`}
              >
                {item.displayName}
              </NavLink>
            );
          })}
        </nav>

        <span className="nav-spacer" />

        <Button size="sm" onClick={handleStart} flexShrink={0}>
          {activeWorkout ? "Resume Workout" : "Start Workout"}
        </Button>
      </div>
    </header>
  );
}
