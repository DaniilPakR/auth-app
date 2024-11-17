import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

let authContextReference = null;

export default function AuthProvider({children}) {
  const [isLogged, setIsLogged] = useState(false);
  const [currentSession, setCurrentSession] = useState("");
  const [panels, setPanels] = useState({
    errorPanelMessage: "",
    statusPanelMessage: "",
  });

  const externalSetIsLogged = (bool) => {
    setIsLogged(bool)
  };

  const showError = (message) => {
    setPanels({
      ...panels,
      errorPanelMessage: message,
    });
    setTimeout(() => {
      setPanels({
        ...panels,
        errorPanelMessage: "",
      });
    }, 1000)
  };

  const showStatus = (message) => {
    setPanels({
      ...panels,
      statusPanelMessage: message,
    });
    setTimeout(() => {
      setPanels({
        ...panels,
        statusPanelMessage: "",
      });
    }, 1000)
  };


  const switchIsLogged = () => {
    setIsLogged(prevIsLogged => !prevIsLogged);
    console.log(isLogged);
  }

  console.log(currentSession)

  const contextValue = {
    isLogged,
    switchIsLogged,
    externalSetIsLogged,
    currentSession,
    setCurrentSession,
    showError,
    showStatus,
    statusPanelMessage: panels.statusPanelMessage,
    errorPanelMessage: panels.errorPanelMessage,
  }

  authContextReference = contextValue;

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export { authContextReference }