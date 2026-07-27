import React , {useEffect} from "react";
import { useContext } from "react";
export const AuthContext = React.createContext();

// Context Api for Authentication

export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading  , setLoading] = React.useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo")
    if(userInfo){
        try {
            setUser(JSON.parse(userInfo))
        } catch (error) {
            localStorage.removeItem("userInfo");
         
            
        }
    }
    setLoading(false);
} , [])

    const login = (userData)=>{
        localStorage.setItem("userInfo",JSON.stringify(userData));
        localStorage.setItem("token", userData.token)
        setUser(userData)
    };

    const logout = ()=>{
        localStorage.removeItem("userInfo");
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{user , loading , login , logout}}>
                {children}
         </AuthContext.Provider>
    )

};

export const useAuth = () => {
    return useContext(AuthContext);
};

