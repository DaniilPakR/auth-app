import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

let authContextReference = null;

export default function AuthProvider({children}) {
  const [isLogged, setIsLogged] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([])

  const externalSetIsLogged = (bool) => {
    setIsLogged(bool)
  }

  const contextValue = {
    isLogged,
    setIsLogged,
    externalSetIsLogged,
    registeredUsers: [],
  }

  authContextReference = contextValue;

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export { authContextReference }