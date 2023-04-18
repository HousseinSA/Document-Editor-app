import React from "react"
import TextEditor from "./Components/TextEditor"
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom"
import {v4 as uuidv4} from "uuid"

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* routes for two path home and documents */}
          <Route
            path="/"
            exact
            // when the home route load then element is navigated to random documentId
            element={<Navigate to={`/documents/${uuidv4()}`} />}
          />
          {/* random document Id */}
          <Route path="/documents/:id" element={<TextEditor />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
