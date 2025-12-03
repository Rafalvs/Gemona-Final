import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { lazy, Suspense } from 'react';
import { Spinner } from '@heroui/react';

// Lazy loading das páginas - carrega apenas quando necessário
const Contact = lazy(() => import("./pages/Contact"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/user/Login"));
const Profile = lazy(() => import("./pages/user/Profile"));
const Register = lazy(() => import("./pages/user/Register"));
const NewCompany = lazy(() => import('./pages/business/NewCompany'));
const EditCompany = lazy(() => import('./pages/business/EditCompany'));
const BusinessProfile = lazy(() => import('./pages/business/CompanyProfile'));
const NewService = lazy(() => import('./pages/business/NewService'));
const Services = lazy(() => import("./pages/Services"));

// Componente de loading
const PageLoader = () => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #05315f 0%, #f48f42 100%)'
    }}>
        <Spinner size="lg" color="warning" />
    </div>
);
  
export default function App(){
    return (
        <Router>
            <AuthProvider>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="contact" element={<Contact />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Register />} />
                        <Route path="newCompany" element={<NewCompany />} />
                        <Route path="editCompany" element={<EditCompany />} />
                        <Route path="companyProfile" element={<BusinessProfile />} />
                        <Route path="newService" element={<NewService />} />
                        <Route path="services" element={<Services />} />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </Router>
    )
}