import "./App.css";
import { Route, Routes } from "react-router-dom";
import Feed from "./pages/feed";
import About from "./pages/about";
import Privacy from "./pages/privacy";
import Register from "./pages/register";
import Login from "./pages/login";
import Profile from "./pages/profile";
import People from "./pages/people";
import Connection from "./pages/connection";
import Chat from "./pages/chat";

import Error404Page from "./error/404";
import Error401Page from "./error/401";
import ProtectedRoute from "./components/ProtectedRoute";
import FeedPage from "./pages/feedPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Feed />} />
      <Route path="/feed/:feedId" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile/:userId" element={<Profile />} />
      <Route path="/about" element={<About />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/people" element={<People />} />
      <Route path="/connection/:userId" element={<Connection />} />
      <Route path="/connection" element={<Connection />} />
      <Route path="/messaging" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/messaging/:targetId" element={<ProtectedRoute><Chat /></ProtectedRoute>}/>
      <Route path="/401" element={<Error401Page />} />
      <Route path="*" element={<Error404Page />} />
    </Routes>
  );
}

export default App;
