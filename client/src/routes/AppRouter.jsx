import { Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { Home } from "../pages/Home";
import { Library } from "../pages/Library";
import { Login } from "../pages/Login";
import { PlaylistDetail } from "../pages/PlaylistDetail";
import { CategoryDetail } from "../pages/CategoryDetail";
import { Radio } from "../pages/Radio";
import { Profile } from "../pages/Profile";
import { Register } from "../pages/Register";
import { Search } from "../pages/Search";
import { Upload } from "../pages/Upload";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="playlists/:id" element={<PlaylistDetail />} />
        <Route path="categories/:genre" element={<CategoryDetail />} />
        <Route path="radio" element={<Radio />} />
        <Route element={<ProtectedRoute />}>
          <Route path="library" element={<Library />} />
          <Route path="upload" element={<Upload />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
    </Routes>
  );
}
