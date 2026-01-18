import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showLogout, setShowLogout] = useState(false);
    const [showSystemLoading, setShowSystemLoading] = useState(false);

    useEffect(() => {
        // Check for existing token and user data on mount
        const storedToken = localStorage.getItem('InterPrepaccessToken');
        const storedUser = localStorage.getItem('userData');

        console.log('🔐 Auth initialization:', {
            hasToken: !!storedToken,
            hasUser: !!storedUser,
            userId: storedUser ? JSON.parse(storedUser)?._id : null
        });

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (InterPrepaccessToken, userData, isFirstTime = false, showLoading = false) => {
        localStorage.setItem('InterPrepaccessToken', InterPrepaccessToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        setToken(InterPrepaccessToken);
        setUser(userData);

        // Show system loading if requested
        if (showLoading) {
            setShowSystemLoading(true);
        } else {
            // Check if this is the first time login
            const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
            if (!hasSeenOnboarding || isFirstTime) {
                setShowOnboarding(true);
            }
        }
    };

    const completeOnboarding = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        setShowOnboarding(false);
    };

    const completeSystemLoading = () => {
        setShowSystemLoading(false);
        // After system loading, check if we should show onboarding
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding) {
            setShowOnboarding(true);
        }
    };

    const logout = () => {
        // Show logout animation
        setShowLogout(true);
    };

    const completeLogout = () => {
        // Actually perform logout after animation
        localStorage.removeItem('InterPrepaccessToken');
        localStorage.removeItem('userData');
        setToken(null);
        setUser(null);
        setShowLogout(false);
    };

    const updateUser = (updatedData) => {
        const updatedUser = { ...user, ...updatedData };
        localStorage.setItem('userData', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            logout,
            updateUser,
            loading,
            showOnboarding,
            completeOnboarding,
            showLogout,
            completeLogout,
            showSystemLoading,
            completeSystemLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
