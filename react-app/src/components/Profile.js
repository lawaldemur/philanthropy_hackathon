// ./react-app/src/components/Profile.js
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "./Nav";
import { useAuth0 } from '@auth0/auth0-react';
import Modal from 'react-modal';


// Set the app element for accessibility
Modal.setAppElement('#root');

function Profile() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const [profile, setProfile] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postData, setPostData] = useState({
    title: '',
    description: '',
    category_id: '',
    image_url: '',
    location: '',
    requirements: ''
  });
  const [categories, setCategories] = useState([]);
  const auth0_sub = user.sub;

  // Fetch user profile from backend
  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          const response = await fetch(`http://localhost:8000/get_user/${auth0_sub}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            setProfile(data);
          } else {
            const errorData = await response.json();
            console.error("Failed to fetch profile:", errorData.message);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };

    fetchProfile();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // Fetch categories for post creation
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:8000/get_categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch categories:", errorData.message);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Handle input changes for profile editing
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prevProfile => ({
      ...prevProfile,
      [name]: value
    }));
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:8000/update_profile/${auth0_sub}`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        setIsEditMode(false);
        alert("Profile updated successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating your profile.");
    }
  };

  // Handle input changes for new post
  const handlePostChange = (e) => {
    const { name, value } = e.target;
    setPostData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle new post form submission
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      // Convert requirements from comma-separated string to array
      const requirementsArray = postData.requirements
        .split(',')
        .map(req => req.trim())
        .filter(req => req !== "");

      const response = await fetch(`http://localhost:8000/create_post/${auth0_sub}`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...postData,
          requirements: requirementsArray
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert("Volunteering post created successfully!");
        setIsModalOpen(false);
        // Optionally, reset the form
        setPostData({
          title: '',
          description: '',
          category_id: '',
          image_url: '',
          location: '',
          requirements: ''
        });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("An error occurred while creating the post.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    isAuthenticated && profile && (
      <main className="app">
        <Nav />
        {/* Profile Content */}
        <div className="bg-white flex flex-col w-full p-6">
          {/* Banner Image */}
          <div className="relative h-40 w-full mb-4">
            <img
              src={profile.avatar_url || "https://static.bandana.co/users/profile/default/default.jpg"}
              alt="Profile Banner"
              className="object-cover w-full h-full"
            />
          </div>

          {/* Profile Details */}
          <div className="flex flex-col md:flex-row w-full gap-6">
            {/* Profile Info */}
            <div className="w-full md:w-1/3 flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
                <img
                  src={profile.avatar_url || "https://static.bandana.co/users/profile/default/default.jpg"}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                {isEditMode ? (
                  <form onSubmit={handleProfileSubmit} className="w-full">
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={profile.first_name || ''}
                        onChange={handleProfileChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={profile.last_name || ''}
                        onChange={handleProfileChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        required
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={profile.email || ''}
                        disabled
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <input
                        type="text"
                        name="phone_number"
                        value={profile.phone_number || ''}
                        onChange={handleProfileChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={profile.location || ''}
                        onChange={handleProfileChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700">Avatar URL</label>
                      <input
                        type="text"
                        name="avatar_url"
                        value={profile.avatar_url || ''}
                        onChange={handleProfileChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">Bio</label>
                      <textarea
                        name="bio"
                        value={profile.bio || ''}
                        onChange={handleProfileChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={() => setIsEditMode(false)}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold">{profile.first_name} {profile.last_name}</h2>
                    <p className="text-gray-500">{profile.email}</p>
                    <p className="text-gray-500">{profile.phone_number || 'Phone number not provided'}</p>
                    <p className="text-gray-500">{profile.location || 'Location not provided'}</p>
                    <p className="mt-2">{profile.bio || 'No bio available.'}</p>
                    <button
                      className="bg-yellow-500 text-brown px-4 py-2 rounded mt-4"
                      onClick={() => setIsEditMode(true)}
                    >
                      Edit Profile
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Profile Checklist */}
            <div className="w-full md:w-2/3 bg-gray-100 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">2/3 Tasks Left</h3>
              <div className="bg-yellow-500 h-2 w-1/3 mb-4"></div>
              <ul className="space-y-2">
                <li className="flex items-center justify-between">
                  <span>Add your phone number</span>
                  {!profile.phone_number && (
                    <button
                      className="text-yellow-500 hover:underline"
                      onClick={() => setIsEditMode(true)}
                    >
                      Add
                    </button>
                  )}
                </li>
                <li className="flex items-center justify-between">
                  <span>Add your location</span>
                  {!profile.location && (
                    <button
                      className="text-yellow-500 hover:underline"
                      onClick={() => setIsEditMode(true)}
                    >
                      Add
                    </button>
                  )}
                </li>
                {/* Add more tasks as needed */}
              </ul>
              <button
                className="mt-6 bg-green-500 text-white px-4 py-2 rounded"
                onClick={() => setIsModalOpen(true)}
              >
                Create New Volunteering Post
              </button>
            </div>
          </div>
        </div>

        {/* Create Post Modal */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          contentLabel="Create New Volunteering Post"
          className="max-w-3xl mx-auto mt-20 bg-white p-6 rounded shadow-lg"
          overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-start z-50"
        >
          <h2 className="text-2xl font-bold mb-4">Create New Volunteering Post</h2>
          <form onSubmit={handlePostSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={postData.title}
                onChange={handlePostChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={postData.description}
                onChange={handlePostChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                rows="4"
                required
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                name="category_id"
                value={postData.category_id}
                onChange={handlePostChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Image URL</label>
              <input
                type="text"
                name="image_url"
                value={postData.image_url}
                onChange={handlePostChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={postData.location}
                onChange={handlePostChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Requirements (comma-separated)</label>
              <input
                type="text"
                name="requirements"
                value={postData.requirements}
                onChange={handlePostChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="mr-4 bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Create Post
              </button>
            </div>
          </form>
        </Modal>

        {/* Footer */}
        <footer className="bg-brown text-white p-6 mt-8">
          <div className="flex justify-between">
            <div className="space-y-2">
              <a href="/" className="block hover:underline">
                Home
              </a>
              <a href="/about" className="block hover:underline">
                About
              </a>
              <a href="/search" className="block hover:underline">
                Search Jobs
              </a>
              <a href="/contact" className="block hover:underline">
                Contact Us
              </a>
            </div>
            <div className="space-y-2">
              <a href="/terms" className="block hover:underline">
                Terms & Conditions
              </a>
              <a href="/privacy" className="block hover:underline">
                Privacy Policy
              </a>
            </div>
          </div>
          <p className="mt-4">
            &copy; Workwise Solutions Inc. 2024. All rights reserved.
          </p>
        </footer>
      </main>
    )
  );
}

export default Profile;
