import React, { useState } from "react";
import DeleteIcon from "@material-ui/icons/Delete";
import MoreVertIcon from "@material-ui/icons/MoreVert";

function Note(props) {
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = () => {
    props.onDelete(props.id);
  };

  // const handleMenuOption = (option) => {
  //   if (option === "Master") {
  //     fetch("http://localhost:5000/export-to-docs", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         title: props.title,
  //         content: props.content,
  //         userId: localStorage.getItem("userId"),
  //       }),
  //     })
  //       .then((res) => res.json())
  //       .then((data) => {
  //         if (data.success) {
  //           alert("Note mastered and moved to Google Docs!");
  //           props.onMaster(props.id); // 🟢 tell Home to remove it
  //         } else {
  //           alert("Please connect your Google account first.");
  //           window.location.href = `http://localhost:5000/google/auth?state=${localStorage.getItem(
  //             "userId"
  //           )}`;
  //         }
  //       })
  //       .catch(() => alert("Failed to export note"));
  //   }

  //   setShowMenu(false);
  // };


  const handleMenuOption = (option) => {
  if (option === "Master") {
    fetch("http://localhost:5000/export-to-docs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: props.title,
        content: props.content,
        userId: localStorage.getItem("userId"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Note mastered and moved to Google Docs!");
          props.onMaster(props.id); // tell Home to remove this note from UI + localStorage
        } else {
          alert("Please connect your Google account first.");
          window.location.href = `http://localhost:5000/google/auth?state=${localStorage.getItem(
            "userId"
          )}`;
        }
      })
      .catch(() => alert("Failed to export note"));
  }

  setShowMenu(false);
};

  return (
    <div className="note" style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <div style={{ position: "relative" }}>
          <MoreVertIcon
            onClick={() => setShowMenu(!showMenu)}
            style={{ cursor: "pointer", fontSize: "20px" }}
          />
          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: "22px",
                left: "0",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "5px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                zIndex: 10,
                minWidth: "120px",
              }}
            >
              <div
                onClick={() => handleMenuOption("Master")}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
              >
                Master
              </div>
              <div
                onClick={() => handleMenuOption("Verify")}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
              >
                Verify
              </div>
              <div
                onClick={() => handleMenuOption("Check Grammar")}
                style={{ padding: "8px 12px", cursor: "pointer" }}
              >
                Check Grammar
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleDelete}
          style={{ background: "none", border: "none" }}
        >
          <DeleteIcon />
        </button>
      </div>

      <h1 style={{ margin: "0 0 6px 0" }}>{props.title}</h1>
      <p style={{ margin: 0 }}>{props.content}</p>
    </div>
  );
}

export default Note;
