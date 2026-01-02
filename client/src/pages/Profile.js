import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="profile">
      <h1>Your Profile</h1>
      <div className="profile-info">
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Role:</strong> {user?.role === 'owner' ? 'Restaurant Owner' : 'Food Lover'}</p>
        {user?.location && <p><strong>Location:</strong> {user.location}</p>}
        {user?.bio && <p><strong>Bio:</strong> {user.bio}</p>}
      </div>
      <p>Profile editing features coming soon!</p>
    </div>
  );
};

export default Profile;