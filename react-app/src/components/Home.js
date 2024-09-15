import React, { useEffect, useState } from "react";
import axios from 'axios';
import Modal from "./Modal";
import Nav from "./Nav";
import { useAuth0 } from "@auth0/auth0-react";
import ProfilePictureUpload from "./ProfilePictureUpload";
import MapComponent from "./MapComponent";

function Home() {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryId(
      selectedCategoryId === categoryId ? null : categoryId
    );
  };

  const filteredPosts = selectedCategoryId
    ? posts.filter((post) => post["category_id"] === selectedCategoryId)
    : posts;


    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const response = await axios.get('/api/user-data');
          setUserData(response.data);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
  
      fetchUserData();
    }, []);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let url = "http://localhost:8000/get_posts";
        let headers = {};

        if (isAuthenticated) {
          const token = await getAccessTokenSilently();
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers });
        const data = await response.json();
        console.log(`data: ${data}`);
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [getAccessTokenSilently, isAuthenticated]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let url = "http://localhost:8000/get_categories";
        let headers = {};

        if (isAuthenticated) {
          const token = await getAccessTokenSilently();
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, { headers });
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [getAccessTokenSilently, isAuthenticated]);

  const openModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="relative h-screen flex overflow-hidden">

        <div className="w-full sm:w-1/2 h-full overflow-y-auto bg-white bg-opacity-90 z-10">
          <Nav isLoggedIn={isLoggedIn} userData={userData} />
          <ProfilePictureUpload userData={userData} />
          <header
            className="w-full container mx-auto"
            style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1565803974275-dccd2f933cbb")',
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          height: "400px",
            }}
          >
            <div className="flex flex-col items-center py-12">
            <p className="font-black text-white uppercase text-5xl">
              Volunteer Hub
            </p>
            <p className="text-lg text-white">
              Discover volunteers in your area
            </p>
          </div>
        </header>

        {/* Categories Section */}
        <nav className="w-full py-4 border-t border-b bg-gray-100">
          <div className="block sm:hidden">
            <button
              className="block md:hidden text-base font-bold uppercase text-center flex justify-center items-center"
              onClick={() => setOpen(!open)}
            >
              Topics{" "}
              <i
                className={`fas ml-2 ${
                  open ? "fa-chevron-down" : "fa-chevron-up"
                }`}
              ></i>
            </button>
          </div>
          <div
            className={`w-full flex-grow sm:flex sm:items-center sm:w-auto ${
              open ? "block" : "hidden"
            }`}
          >
            <div className="w-full container mx-auto flex flex-col sm:flex-row items-center justify-center text-sm font-bold uppercase mt-0 px-6 py-2">
              {categories.map((category) => (
                <button
                  key={category["_id"]}
                  className={`hover:bg-gray-400 rounded py-2 px-4 mx-2 ${
                    selectedCategoryId === category["_id"]
                      ? "bg-gray-500 text-white"
                      : ""
                  }`}
                  onClick={() => handleCategoryClick(category["_id"])}
                >
                  {category["name"]}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="px-6 py-4">
          {filteredPosts.map((post, index) => {
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
      </div>

      {/* Map Section */}
      <div className="w-full sm:w-1/2 h-full fixed right-0 top-0">
        <MapComponent />
      </div>
    </div>
  );
}

export default Home;
