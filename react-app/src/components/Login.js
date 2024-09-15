import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LoginButton = ({isLoggedIn, userData}) => {
 

  const handleLogin = async () => {
    try {
      window.location.href = '/api/login';
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.get('/api/logout');
      //TO FIX  IN THE FUTURE
      window.location.href = '/';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (isLoggedIn) {
    return (
      <div>
        <h2>Welcome, {userData.first_name}!</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return <button onClick={handleLogin}>Log in with Google</button>;
};

export default LoginButton;