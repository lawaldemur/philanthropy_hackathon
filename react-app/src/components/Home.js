import React, { useEffect, useState } from "react";
import axios from 'axios';
import Modal from "./Modal";
import Nav from "./Nav";
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

        const response = await fetch(url, { headers });
        const data = await response.json();

        for (let post of data) {
          try {
            const authorResponse = await axios.get(`http://localhost:8000/find_user_by_id/${post["author_id"]}`);
            const author = authorResponse.data;
            post["email"] = author["email"];
          } catch (error) {
            console.error(`Error fetching author for post ${post["author_id"]}:`, error);
          }
        }

        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  },[]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let url = "http://localhost:8000/get_categories";
        let headers = {};

        const response = await fetch(url, { headers });
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const openModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="relative flex flex-col min-h-screen">
      <div className="bg-white bg-opacity-90">
        <Nav isLoggedIn={isLoggedIn} userData={userData} />
        
        <header
          className="w-full container-fluid"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1565803974275-dccd2f933cbb")',
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            height: "400px",
          }}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <p className="font-black text-white uppercase text-5xl mb-2">
              Volunteer Hub
            </p>
            <p className="text-lg text-white">
              Discover volunteers in your area
            </p>
          </div>
        </header>

        <div className="flex flex-col md:flex-row mx-auto px-4 py-8">
          <div className="w-full md:w-2/3 pr-0 md:pr-8 mb-8 md:mb-0">
            <nav className="w-full py-4 border-t border-b bg-gray-100 mb-8">
              <div className="block sm:hidden">
                <button
                  className="block md:hidden text-base font-bold uppercase text-center flex justify-center items-center w-full"
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
                  open ? "block" : "hidden sm:flex"
                }`}
              >
                <div className="w-full container mx-auto flex flex-wrap justify-center text-sm font-bold uppercase mt-0 px-6 py-2">
                  {categories.map((category) => (
                    <button
                      key={category["_id"]}
                      className={`hover:bg-gray-400 rounded py-2 px-4 mx-2 mb-2 ${
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

            <div className="space-y-8">
              {filteredPosts.map((post, index) => {
                const category = categories.find(
                  (category) => category["_id"] === post["category_id"]
                );
                return (
                  <article
                    key={post.id || index}
                    className="flex flex-col shadow my-4 w-full cursor-pointer"
                    onClick={() => openModal(post)}
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
                      <p className="pb-6">{post.description}</p>
                      <div>
                        <p className="text-gray-600 text-sm">
                        Zip Code: {post.location}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        
                        <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                          {category ? category.name : "Category not found"}
                        </span>
                        
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
          
          <div className="w-full md:w-1/3">
            <div className="aspect-square">
              <MapComponent filteredPosts={filteredPosts} />
            </div>
          </div>
        </div>

        {isModalOpen && (
          <Modal selectedPost={selectedPost} closeModal={closeModal} />
        )}
      </div>
    </div>
  );
}

export default Home;
