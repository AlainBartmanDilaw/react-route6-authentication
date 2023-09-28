import React from 'react';
import './App.css';
import {Navigate, NavLink, Route, Routes, useLocation, useNavigate} from "react-router-dom";

const fakeAuth = ()=>
    new Promise((resolve)=>{
        setTimeout(()=>resolve('2342f2f1d131rf12'), 250);
    });

const NoMatch = ()=>{
    return (
        <>
            <h2>Impossible de trouver cette route.</h2>
        </>
    );
};

const Home = ()=>{
    const {onLogin} = useAuth()
    return (
        <>
            <h2>Home (Public)</h2>
            <button type={"button"} onClick={onLogin}>Sign In</button>
        </>
    );
};

const useAuth = ()=>{
    return React.useContext(AuthContext);
};

const Dashboard = ()=>{
    const {token} = useAuth();
    return (
        <>
            <h2>Dashboard (Protected)</h2>
            <div>Authenticated as {token}</div>
        </>
    );
};

const AuthContext = React.createContext(null);

const ProtectedRoute = ({children})=>{
    const {token} = useAuth();
    const location = useLocation();

    if (!token) {
        return <Navigate to={"/home"} replace
                         state={{from: location}}
        />;
    }
    return children;
}

const AuthProvider = ({children})=>{
    const navigate = useNavigate();
    const location = useLocation()

    const [token, setToken] = React.useState(null);

    const handleLogin = async ()=>{
        const token = await fakeAuth();

        setToken(token);
        const origin = location.state?.from?.pathname || '/dashboard';
        navigate(origin);
    };

    const handleLogout = ()=>{
        setToken(null);
    };

    const value = {
        token,
        onLogin: handleLogin,
        onLogout: handleLogout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

const App = ()=>{
    return (
        <AuthProvider>
            <h1>React Router</h1>
            <Navigation/>

            <Routes>
                <Route index element={<Home/>}/>
                <Route path="home" element={<Home/>}/>
                <Route
                    path="dashboard"
                    element={<ProtectedRoute><Dashboard/></ProtectedRoute>}
                />
                <Route
                    path="admin"
                    element={
                        <ProtectedRoute>
                            <Admin/>
                        </ProtectedRoute>
                    }
                />


                <Route path="*" element={<NoMatch/>}/>
            </Routes>
        </AuthProvider>
    )
}

const MenuOptions = [
    {key: "home", to: "/home", admin: false},
    {key: "dashboard", to: "/dashboard", admin: true},
    {key: "admin", to: "/admin", admin: true},
]

const NavigationLink = ({to, children})=>{
    const {token} = useAuth();

    const menu = MenuOptions.find((e)=>e.key === to);

    return (
        <>
            {(menu.admin === false || token) && (
                <NavLink to={to}>{children}</NavLink>
            )}
        </>
    );
}

const Navigation = ()=>{
    const {token, onLogout} = useAuth();

    return (
        <nav>
            <NavigationLink to="home">Home</NavigationLink>
            <NavigationLink to="dashboard">Dashboard</NavigationLink>
            <NavigationLink to="admin">Admin</NavigationLink>
            {token && (
                <button type={"button"} onClick={onLogout}>Sign Out</button>
            )}
        </nav>
    );
}

const Admin = ()=>{
    return (
        <>
            <h2>Admin (Protected)</h2>
        </>
    );
};
export default App;
