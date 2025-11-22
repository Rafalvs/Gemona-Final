import { BrowserRouter as Router, Routes, Route, BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import Home from "./pages/Home";
import Login from "./pages/user/Login";
import Profile from "./pages/user/Profile";
import Register from "./pages/user/Register";
import NewCompany from './pages/business/NewCompany';
import EditCompany from './pages/business/EditCompany';
import BusinessProfile from './pages/business/CompanyProfile';
import NewService from './pages/business/NewService';
import Services from "./pages/Services";
import AdminCRUD from "./pages/AdminCRUD";
  
export default function App(){
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="createBusiness" element={<NewCompany />} />
                    <Route path="editBusiness" element={<EditCompany />} />
                    <Route path="newCompany" element={<NewCompany />} />
                    <Route path="businessProfile" element={<BusinessProfile />} />
                    <Route path="createService" element={<NewService />} />
                    <Route path="services" element={<Services />} />
                    <Route path="admin" element={<AdminCRUD />} />
                </Routes>
            </Router>
        </AuthProvider>
    )
}