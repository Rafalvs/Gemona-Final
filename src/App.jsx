import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
  
export default function App(){
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="contact" element={<Contact />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="newCompany" element={<NewCompany />} />
                    <Route path="editCompany" element={<EditCompany />} />
                    <Route path="companyProfile" element={<BusinessProfile />} />
                    <Route path="newService" element={<NewService />} />
                    <Route path="services" element={<Services />} />
                </Routes>
            </AuthProvider>
        </Router>
    )
}