import React, { useState } from "react";
import { Switch, Route, Redirect, useHistory } from "react-router-dom";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import ViewQuizzes from "./pages/ViewQuizzes";
import Dashboard from "./pages/Dashboard";
import Streaks from "./pages/Streaks";
import Login from "./pages/Login";
import Register from "./pages/Register";

const App = () => {
  const history = useHistory();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    history.push("/login");
  };

  return (
    <div>
      <Header onLogout={handleLogout} isLoggedIn={isLoggedIn} />

      <Switch>
        {/* Public routes */}
        <Route path="/login">
          {isLoggedIn ? (
            <Redirect to="/" />
          ) : (
            <Login onLoginSuccess={() => setIsLoggedIn(true)} />
          )}
        </Route>

        <Route path="/register">
          {isLoggedIn ? (
            <Redirect to="/" />
          ) : (
            <Register onRegisterSuccess={() => history.push("/login")} />
          )}
        </Route>

        {/* Protected routes */}
        {isLoggedIn ? (
          <>
            <Route exact path="/" component={Home} />
            <Route path="/prev-quizzes" component={ViewQuizzes} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/streaks" component={Streaks} />
          </>
        ) : (
          <Redirect to="/login" />
        )}
      </Switch>

      <Footer />
    </div>
  );
};

export default App;
