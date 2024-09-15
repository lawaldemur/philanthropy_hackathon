// ./react-app/src/components/Profile.js

import React, { useEffect, useState } from "react";
import Nav from "./Nav";
import Modal from "react-modal";
import axios from "axios";

// Set the app element for accessibility
Modal.setAppElement("#root");

function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postData, setPostData] = useState({
    title: "",
    description: "",
    category_id: "",
    image_url: "",
    location: "",
    requirements: "",
  });
  const [categories, setCategories] = useState([]);
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/user-data");
        console.log("User Data:", response.data);

        const email = response.data.email;
        const userResponse = await axios.get(`/find_user_by_email/${email}`);
        console.log("User Response:", userResponse.data);

        setUserData(userResponse.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsAuthenticated(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch profile whenever userData or isAuthenticated changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && userData && userData.email) {
        try {
          const response = await axios.get(
            `/find_user_by_email/${userData.email}`
          );
          setProfile(response.data);
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };

    fetchProfile();
  }, [isAuthenticated, userData]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/get_categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let url = "http://localhost:8000/get_posts";
        let headers = {};

        const response = await fetch(url, { headers });
        const data = await response.json();
        console.log(`data: ${data}`);

        let result = [];
        for (let i = 0; i < data.length; i++) {
          if (data[i].author_id === userData.id)
            result.push(data[i]);
        }

        setPosts(result);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [isAuthenticated, userData]);

  // Handle input changes for profile editing
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `/update_profile/${userData.auth0_sub}`,
        profile
      );

      if (response.status === 200) {
        setIsEditMode(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating your profile.");
    }
  };

  // Handle input changes for new post
  const handlePostChange = (e) => {
    const { name, value } = e.target;
    setPostData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle new post form submission
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert requirements from comma-separated string to array
      const requirementsArray = postData.requirements
        .split(",")
        .map((req) => req.trim())
        .filter((req) => req !== "");

      const payload = {
        ...postData,
        requirements: requirementsArray,
      };

      const response = await axios.post(
        `/create_post/${userData.auth0_sub}`,
        payload
      );

      if (response.status === 201) {
        alert("Volunteering post created successfully!");
        setIsModalOpen(false);
        // Reset the form
        setPostData({
          title: "",
          description: "",
          category_id: "",
          image_url: "",
          location: "",
          requirements: "",
        });
      } else {
        alert("Failed to create post.");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert("An error occurred while creating the post.");
    }
  };

  const openModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };


  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <main className="app">
      <Nav />
      {/* Profile Content */}
      <div className="bg-white flex flex-col w-full p-6">
        {/* Banner Image */}
        <div className="relative h-40 w-full mb-4">
          <img
            src={
              profile.avatar_url ||
              "https://static.bandana.co/users/profile/default/default.jpg"
            }
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
                src={
                  profile.avatar_url ||
                  "https://static.bandana.co/users/profile/default/default.jpg"
                }
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              {isEditMode ? (
                <form onSubmit={handleProfileSubmit} className="w-full">
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={profile.first_name || ""}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={profile.last_name || ""}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email || ""}
                      disabled
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone_number"
                      value={profile.phone_number || ""}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={profile.location || ""}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Avatar URL
                    </label>
                    <input
                      type="text"
                      name="avatar_url"
                      value={profile.avatar_url || ""}
                      onChange={handleProfileChange}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={profile.bio || ""}
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
                  <h2 className="text-2xl font-bold">
                    {profile.first_name} {profile.last_name}
                  </h2>
                  <p className="text-gray-500">{profile.email}</p>
                  <p className="text-gray-500">
                    {profile.phone_number || "Phone number not provided"}
                  </p>
                  <p className="text-gray-500">
                    {profile.location || "Location not provided"}
                  </p>
                  <p className="mt-2">{profile.bio || "No bio available."}</p>
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
          <div className="px-6 py-4">
          {posts.map((post, index) => {
            const category = categories.find(
              (category) => category["_id"] === post["category_id"]
            );
            // console.log(post);
            // console.log("HELLO");
            return (
              <section
                className="w-full flex flex-col items-center px-3 post-section-wrapper"
                key={post.id || index}
              >
                <article
                  className="flex  flex-col shadow my-4"
                  onClick={() => openModal(post)}
                  style={{ width: "100%" }}
                >
                  <div className="bg-white flex flex-col justify-start p-6">
                    <span className="text-blue-700 text-sm font-bold uppercase pb-4">
                      {category ? category.name : "Category not found"}
                    </span>
                    <span className="text-3xl font-bold hover:text-gray-700 pb-4">
                      {post.title}
                    </span>
                    <p className="text-sm pb-3">
                      By{" "}
                      <span className="font-semibold hover:text-gray-800">
                        {post.author_first_name} {post.author_last_name}
                      </span>
                    </p>
                    <p>{post.description}</p>
                    <div>
                      <p className="text-gray-600 text-sm">
                        Financial District · 100 Gold St · New York
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex space-x-2">
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Full-time
                        </span>
                        <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                          Government
                        </span>
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          7 days ago
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </section>
            );
          })}
          {isModalOpen && (
            <Modal selectedPost={selectedPost} closeModal={closeModal} />
          )}
        </div>
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
        <h2 className="text-2xl font-bold mb-4">
          Create New Volunteering Post
        </h2>
        <form onSubmit={handlePostSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
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
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
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
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              name="category_id"
              value={postData.category_id}
              onChange={handlePostChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              type="text"
              name="image_url"
              value={postData.image_url}
              onChange={handlePostChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={postData.location}
              onChange={handlePostChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Requirements (comma-separated)
            </label>
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
  );
}

export default Profile;
