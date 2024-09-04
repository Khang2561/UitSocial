import { createContext, useContext, useState, ReactNode } from "react";

// Định nghĩa kiểu cho context
interface AuthContextType {
    user: any; // Bạn có thể thay đổi `any` thành kiểu dữ liệu chính xác của user
    setAuth: (authUser: any) => void; // Cập nhật kiểu cho các hàm
    setUserData: (userData: any) => void;
}

// Tạo context với giá trị mặc định
const AuthContext = createContext<AuthContextType>({
    user: null,
    setAuth: () => {}, // Cung cấp giá trị mặc định cho các hàm
    setUserData: () => {},
});

interface AuthProviderProps {
    children: ReactNode; // Chỉ định kiểu cho children
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<any>(null); // Bạn có thể thay đổi `any` thành kiểu dữ liệu chính xác của user

    const setAuth = (authUser: any) => {
        setUser(authUser);
    };

    const setUserData = (userData: any) => {
        setUser({ ...userData });
    };

    return (
        <AuthContext.Provider value={{ user, setAuth, setUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
