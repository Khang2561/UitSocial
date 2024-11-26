import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
    user: any; // Bạn có thể thay đổi `any` thành kiểu dữ liệu chính xác của user
    setAuth: (authUser: any) => void;
    setUserData: (userData: any) => void;
    clearUserData: () => void; // Thêm hàm để xóa dữ liệu người dùng khi đăng xuất
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    setAuth: () => {},
    setUserData: () => {},
    clearUserData: () => {}, // Cung cấp hàm mặc định cho việc xóa dữ liệu
});

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<any>(null);

    const setAuth = (authUser: any) => {
        setUser(authUser);
    };

    const setUserData = (userData: any) => {
        setUser({ ...userData });
    };

    const clearUserData = () => {
        setUser(null); // Xóa dữ liệu người dùng khi đăng xuất
    };

    return (
        <AuthContext.Provider value={{ user, setAuth, setUserData, clearUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
