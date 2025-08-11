import React, { useState } from "react";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setMsg("Registration successful! You can now login.");
      setEmail("");
      setPassword("");
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
     <div 
     style={{ textAlign: "center", marginTop: "30px" }}
    >
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br /><br />
        <button type="submit">Register</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}

export default Register;
