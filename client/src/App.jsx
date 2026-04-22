import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import TasksPage from "./pages/TasksPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/tasks" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="*" element={<Navigate to="/tasks" replace />} />
    </Routes>
  );
}

