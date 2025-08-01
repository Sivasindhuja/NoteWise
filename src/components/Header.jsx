import React from "react";
import HighlightIcon from "@material-ui/icons/Highlight";

function Header() {
  return (
    <header>
      <h1>
        <HighlightIcon />
        NoteWise 
      </h1>
    </header>
  );
}

export default Header;

// Header.jsx


// import React from "react";
// import HighlightIcon from "@material-ui/icons/Highlight";
// //import { Link } from "react-router-dom";

// function Header() {
//   return (
//     <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px" }}>
//       <h1 style={{ display: "flex", alignItems: "center" }}>
//         <HighlightIcon style={{ marginRight: "10px" }} />
//         NoteWise
//       </h1>
//       <nav style={{ display: "flex", gap: "15px" }}>
//         <Link to="/prev-quizzes" style={{ textDecoration: "none", color: "#333" }}>SeePrevQuizzes</Link>
//         <Link to="/dashboard" style={{ textDecoration: "none", color: "#333" }}>Dashboard</Link>
//         <Link to="/streaks" style={{ textDecoration: "none", color: "#333" }}>Streaks</Link>
//       </nav>
//     </header>
//   );
// }

// export default Header;
