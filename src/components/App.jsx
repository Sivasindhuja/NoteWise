import React, { useState } from "react";
import { Switch, Route,Link } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";
import ViewQuizzes from "./ViewQuizzes";
import Dashboard from "./Dashboard";
import Streaks from "./Streaks";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showLogin, setShowLogin] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div>
        <Header />
        {showLogin ? (
          <>
            <Login onLogin={() => setIsLoggedIn(true)} />
            <p>
              Don’t have an account?{" "}
              <button onClick={() => setShowLogin(false)}>Register</button>
            </p>
          </>
        ) : (
          <>
            <Register />
            <p>
              Already have an account?{" "}
              <button onClick={() => setShowLogin(true)}>Login</button>
            </p>
          </>
        )}
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header onLogout={handleLogout}/>
      

      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/prev-quizzes" component={ViewQuizzes} />
        <Route path="/dashboard" component={Dashboard } />
        <Route path="/streaks" component={Streaks} />

        </Switch>
      

      <Footer />
    </div>
  );
}

export default App;
