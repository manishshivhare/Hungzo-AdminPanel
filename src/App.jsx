import { useState } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Verifications from "./Pages/verification/Verifications";

function App() {
  return (
    <>
    <DashboardLayout/>
    <Routes>
      <Route path="/"  element={  <Verifications /> }/>
      <Route path="/"  element={  <Verifications /> }/>
      <Route path="/"  element={  <Verifications /> }/>
    </Routes>
    </>
  );
}

export default App;
