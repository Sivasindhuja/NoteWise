// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const NotesApp = () => {
//   const [notes, setNotes] = useState([]);
//   const [newNote, setNewNote] = useState("");
//   const [quizTime, setQuizTime] = useState(localStorage.getItem("quizTime") || "");


//   useEffect(() => {
//   console.log("Using API Key in Component:", process.env.REACT_APP_GEMINI_API_KEY);
// }, []);

//   useEffect(() => {
//     const storedNotes = JSON.parse(localStorage.getItem("notes")) || [];
//     setNotes(storedNotes);
//   }, []);

//   useEffect(() => {
//     if (quizTime) {
//       localStorage.setItem("quizTime", quizTime);
//     }
//   }, [quizTime]);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

//       console.log("Checking quiz time:", currentTime, "Stored quiz time:", quizTime);

//       if (quizTime === currentTime) {
//         console.log("Triggering Quiz Generation...");
//         generateQuiz();
//       }
//     }, 60000);

//     return () => clearInterval(interval);
//   }, [quizTime]);

//   const handleAddNote = () => {
//     if (notes.length < 20 && newNote.trim()) {
//       const updatedNotes = [...notes, newNote];
//       setNotes(updatedNotes);
//       localStorage.setItem("notes", JSON.stringify(updatedNotes));
//       setNewNote("");
//     } else {
//       alert("Max limit of 20 notes reached.");
//     }
//   };

//   const handleDeleteNote = (index) => {
//     const updatedNotes = notes.filter((_, i) => i !== index);
//     setNotes(updatedNotes);
//     localStorage.setItem("notes", JSON.stringify(updatedNotes));
//   };
//   console.log("Notes being sent:", notes);

// //   const generateQuiz = async () => {

// //     // const prompt = `Generate quiz questions based on these notes:\n${notes.join("\n")}`;
// // const prompt = `Based on the following notes, generate a multiple-choice quiz with 5 questions. Each question should have 4 answer choices and a correct answer indication.

// // Notes:
// // ${notes.map((note, index) => `${index + 1}. ${note}`).join("\n")}

// // Format the response as follows:
// // Q1: [Question text]
// // A) [Choice 1]
// // B) [Choice 2]
// // C) [Choice 3]
// // D) [Choice 4]
// // Correct Answer: [Letter]
// // `;
// //     try {
// //       const response = await axios.post(
// //         "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.REACT_APP_GEMINI_API_KEY,
// //         {
// //           contents: [
// //             {
//       //         role: "user",
//       //         parts: [{ text: prompt }]
//       //       }
//       //     ]
//       //   },
//       //   {
//       //     headers: { "Content-Type": "application/json" }
//       //   }
//       // );

//   //     console.log("API Response:", response.data);
//   //     alert("Quiz Time! Here are your generated questions:\n" + response.data.candidates[0].content.parts[0].text);
//   //   } catch (error) {
//   //     console.error("Error fetching from Gemini AI:", error.response ? error.response.data : error);
//   //   }
//   // };

//   const generateQuiz = async () => {
//   const latestNotes = JSON.parse(localStorage.getItem("notes")) || [];
//   console.log("Using latest notes:", latestNotes); // Debugging log

//   const prompt = `Create a multiple-choice quiz based on these notes:\n${latestNotes.join("\n")}`;
  
//   try {
//     const response = await axios.post(
//       "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.REACT_APP_GEMINI_API_KEY,
//       {
//         contents: [
//           {
//             role: "user",
//             parts: [{ text: prompt }]
//           }
//         ]
//       },
//       {
//         headers: { "Content-Type": "application/json" }
//       }
//     );

//     console.log("API Response:", response.data);
//     alert("Quiz Time! Here are your generated questions:\n" + response.data.candidates[0].content.parts[0].text);
//   } catch (error) {
//     console.error("Error fetching from Gemini AI:", error.response ? error.response.data : error);
//   }
// };

//   return (
//     <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
//       <h2>Save Your Notes Here (Max 20)</h2>

//       <input
//         type="time"
//         value={quizTime}
//         onChange={(e) => setQuizTime(e.target.value)}
//         style={{ padding: "10px", marginBottom: "10px" }}
//       />
//       <button style={{ padding: "10px", cursor: "pointer" }}>Set Quiz Time</button>

//       <input
//         type="text"
//         value={newNote}
//         onChange={(e) => setNewNote(e.target.value)}
//         placeholder="Type your note here..."
//         style={{ padding: "10px", width: "80%", marginBottom: "10px" }}
//       />
//       <button onClick={handleAddNote} style={{ padding: "10px", cursor: "pointer" }}>
//         Add Note
//       </button>

//       {notes.length === 0 ? (
//         <p>No notes yet! Create a new one now.</p>
//       ) : (
//         <div>
//           {notes.map((note, index) => (
//             <div key={index} style={{ padding: "10px", border: "1px solid #ccc", marginTop: "5px", display: "flex", justifyContent: "space-between" }}>
//               <span>{`Note ${index + 1}: ${note}`}</span>
//               <button onClick={() => handleDeleteNote(index)} style={{ marginLeft: "10px", cursor: "pointer" }}>Delete</button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// console.log("Using API Key:", process.env.REACT_APP_GEMINI_API_KEY);

// export default NotesApp;


import React, { useState, useEffect } from "react";
import axios from "axios";
import "../src/index.css";

const NotesApp = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [quizTime, setQuizTime] = useState(localStorage.getItem("quizTime") || "");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    console.log("Using API Key in Component:", process.env.REACT_APP_GEMINI_API_KEY);
  }, []);

  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem("notes")) || [];
    setNotes(storedNotes);
  }, []);

  useEffect(() => {
    if (quizTime) {
      localStorage.setItem("quizTime", quizTime);
    }
  }, [quizTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

      console.log("Checking quiz time:", currentTime, "Stored quiz time:", quizTime);

      if (quizTime === currentTime) {
        console.log("Triggering Quiz Generation...");
        generateQuiz();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [quizTime]);

  const handleAddNote = () => {
    if (notes.length < 20 && newNote.trim()) {
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      localStorage.setItem("notes", JSON.stringify(updatedNotes));
      setNewNote("");
    } else {
      alert("Max limit of 20 notes reached.");
    }
  };

  const handleDeleteNote = (index) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
    localStorage.setItem("notes", JSON.stringify(updatedNotes));
  };

  console.log("Notes being sent:", notes);

  const generateQuiz = async () => {
    const latestNotes = JSON.parse(localStorage.getItem("notes")) || [];
    console.log("Using latest notes:", latestNotes);

    if (latestNotes.length === 0) {
      console.warn("No notes available for quiz generation!");
      return;
    }

    const prompt = `Create a multiple-choice quiz based on these notes:\n${latestNotes.join("\n")}`;

    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + process.env.REACT_APP_GEMINI_API_KEY,
        {
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("API Response:", response.data);
      const quizText = response.data.candidates[0].content.parts[0].text;
      const questions = parseQuiz(quizText);
      setQuizQuestions(questions);
      setShowResults(false);
    } catch (error) {
      console.error("Error fetching quiz:", error.response ? error.response.data : error);
    }
  };

  const parseQuiz = (quizText) => {
    const questionsArray = quizText.split("\n\n").map((q) => {
      const lines = q.split("\n");
      return {
        question: lines[0],
        options: lines.slice(1, 5),
        correctAnswer: lines[5]?.replace("Correct Answer: ", "").trim()
      };
    });
    return questionsArray;
  };

  const handleAnswerSelection = (questionIndex, answer) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const calculateResults = () => {
    let correctCount = 0;
    quizQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correctCount++;
      }
    });
    setShowResults(true);
    alert(`Your Score: ${correctCount}/${quizQuestions.length}`);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Save Your Notes Here (Max 20)</h2>

      <input type="time" value={quizTime} onChange={(e) => setQuizTime(e.target.value)} style={{ padding: "10px", marginBottom: "10px" }} />
      <button style={{ padding: "10px", cursor: "pointer" }}>Set Quiz Time</button>

      <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Type your note here..." style={{ padding: "10px", width: "80%", marginBottom: "10px" }} />
      <button onClick={handleAddNote} style={{ padding: "10px", cursor: "pointer" }}>Add Note</button>

      {notes.length === 0 ? (
        <p>No notes yet! Create a new one now.</p>
      ) : (
        <div>
          {notes.map((note, index) => (
            <div key={index} style={{ padding: "10px", border: "1px solid #ccc", marginTop: "5px", display: "flex", justifyContent: "space-between" }}>
              <span>{`Note ${index + 1}: ${note}`}</span>
              <button onClick={() => handleDeleteNote(index)} style={{ marginLeft: "10px", cursor: "pointer" }}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {quizQuestions.length > 0 && !showResults && (
        <div>
          {quizQuestions.map((q, index) => (
            <div key={index} style={{ marginBottom: "15px" }}>
              <p>{q.question}</p>
              {q.options.map((option, i) => (
                <div key={i}>
                  <input type="radio" name={`question-${index}`} value={option} onChange={() => handleAnswerSelection(index, option.charAt(0))} />
                  <label>{option}</label>
                </div>
              ))}
            </div>
          ))}
          <button onClick={calculateResults} style={{ padding: "10px", cursor: "pointer" }}>Submit Answers</button>
        </div>
      )}

      {showResults && <h3>Quiz Completed! Check the alert for your score.</h3>}
    </div>
  );
}
export default NotesApp;