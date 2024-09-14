import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

function App() {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return (
    <div className="App">
      {!isAuthenticated && <button onClick={() => loginWithRedirect()}>Log In</button>}
      {isAuthenticated && <button onClick={() => logout()}>Log Out</button>}
    </div>
  );
}

export default App;
