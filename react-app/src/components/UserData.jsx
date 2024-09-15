import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserData = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/user-data');
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) {
    return <div>Loading user data...</div>;
  }

  return (
    <div>
      <h2>User Data</h2>
      <p>Email: {userData.email}</p>
      {/* Display other user data fields */}
    </div>
  );
};

export default UserData;