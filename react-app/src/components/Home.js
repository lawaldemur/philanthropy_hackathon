import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "./Nav";
import { useAuth0 } from "@auth0/auth0-react";

function Home() {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);



  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    // Set the clicked category as the selected category
    console.log('1');
    setSelectedCategoryId(categoryId);
  };

  const filteredPosts = selectedCategoryId
    ? posts.filter(post => post["category_id"] === selectedCategoryId)
    : posts;


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
        console.error("Error fetching posts:", error);
      }
    };

    fetchCategories();
  }, [getAccessTokenSilently, isAuthenticated]);

  const increment = () => {};

  const decrement = () => {};

  const openModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <Nav />
      <header className="w-full container mx-auto">
        <div className="flex flex-col items-center py-12">
          <a
            className="font-bold text-gray-800 uppercase hover:text-gray-700 text-5xl"
            href="#"
          >
            Volunteer Hub
          </a>
          <p className="text-lg text-gray-600">Posts of volunteers in your area</p>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row container mx-auto py-6">
        <div className="w-full sm:w-3/4 flex flex-wrap py-6">
        {filteredPosts.map((post) => {
        const category = categories.find(category => category["_id"] === post["category_id"]);

        return (
          <section className="w-full flex flex-col items-center px-3" key={post.id}>
            <div className="flex flex-col justify-between w-full sm:w-2/3 pl-4">
              {/* Job Title and Company */}
            </div>

            {/* Article */}
            <article className="flex flex-col shadow my-4" onClick={() => openModal(post)}>
              <div className="bg-white flex flex-col justify-start p-6">
                <a href="#" className="text-blue-700 text-sm font-bold uppercase pb-4">
                  {category ? category.name : "Category not found"}
                </a>
                <a href="#" className="text-3xl font-bold hover:text-gray-700 pb-4">
                  {post.title}
                </a>
                <p className="text-sm pb-3">
                  By{" "}
                  <a href="#" className="font-semibold hover:text-gray-800">
                    {post.author_first_name} {post.author_last_name}
                  </a>
                </p>
                <p>{post.description}</p>
                <div>
                  <p className="text-blue-700 font-bold">$46.06 / hr</p>
                  <p className="text-gray-600 text-sm">
                    Financial District · 100 Gold St · New York
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  {/* Badges */}
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
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {selectedPost?.title}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {selectedPost?.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>

        <nav className="w-full py-4 border-t border-b bg-gray-100">
          <div className="block sm:hidden">
            <a
              href="#"
              className="block md:hidden text-base font-bold uppercase text-center flex justify-center items-center"
              onClick={() => setOpen(!open)}
            >
              Topics{" "}
              <i
                className={`fas ml-2 ${
                  open ? "fa-chevron-down" : "fa-chevron-up"
                }`}
              ></i>
            </a>
          </div>
          <div
            className={`w-full flex-grow sm:flex sm:items-center sm:w-auto ${
              open ? "block" : "hidden"
            }`}
          >
            <div className="w-full container mx-auto flex flex-col sm:flex-row items-center justify-center text-sm font-bold uppercase mt-0 px-6 py-2">
              { categories.map((category) => ( 
              <a href="#" className="hover:bg-gray-400 rounded py-2 px-4 mx-2" data-id={category["id"]} onClick={() => handleCategoryClick(category["_id"])}>
                {category["name"]}
              </a>
              ))}
            </div>
          </div>
        </nav>
      </div>

      <footer className="w-full border-t bg-white pb-12">
        <div className="w-full container mx-auto flex flex-col items-center">
          <div className="flex flex-col md:flex-row text-center md:text-left md:justify-between py-6">
            <a href="#" className="uppercase px-3">
              About Us
            </a>
            <a href="#" className="uppercase px-3">
              Privacy Policy
            </a>
            <a href="#" className="uppercase px-3">
              Terms & Conditions
            </a>
            <a href="#" className="uppercase px-3">
              Contact Us
            </a>
          </div>

          <div className="uppercase pb-6">&copy; myblog.com</div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
