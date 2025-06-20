import React, { createContext, useState, useContext } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userData, setUserData] = useState(null); // inicia vazio

  const logout = () => {
    setUserData(null);
    // aqui você pode adicionar outras ações, como limpar AsyncStorage, redirecionar, etc.
  };

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
