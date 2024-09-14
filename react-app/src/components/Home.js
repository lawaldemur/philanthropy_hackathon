import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "./Nav";
import { useAuth0 } from "@auth0/auth0-react";

function Home() {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [posts, setPosts] = useState([]);
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

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

  const increment = () => {};

  const decrement = () => {};

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
          {/* Main Content Section */}
          {posts.map((post) => (
            <section className="w-full flex flex-col items-center px-3">
              <div className="flex flex-col justify-between w-full sm:w-2/3 pl-4">
                {/* Job Title and Company */}
              </div>

              {/* Article 1 */}
              <article className="flex flex-col shadow my-4">
                <div className="bg-white flex flex-col justify-start p-6">
                  <a
                    href="#"
                    className="text-blue-700 text-sm font-bold uppercase pb-4"
                  >
                    Technology
                  </a>
                  <a
                    href="#"
                    className="text-3xl font-bold hover:text-gray-700 pb-4"
                  >
                    {post["title"]}
                  </a>
                  <p className="text-sm pb-3">
                    By{" "}
                    <a href="#" className="font-semibold hover:text-gray-800">
                      {post["author_first_name"]} {post["author_last_name"]}
                    </a>
                  </p>
                  <p>{post["description"]}</p>
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
          ))}
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
              <a href="#" className="hover:bg-gray-400 rounded py-2 px-4 mx-2">
                Technology
              </a>
              <a href="#" className="hover:bg-gray-400 rounded py-2 px-4 mx-2">
                Automotive
              </a>
              <a href="#" className="hover:bg-gray-400 rounded py-2 px-4 mx-2">
                Finance
              </a>
              <a href="#" className="hover:bg-gray-400 rounded py-2 px-4 mx-2">
                Politics
              </a>
              <a href="#" className="hover:bg-gray-400 rounded py-2 px-4 mx-2">
                Culture
              </a>
              <a href="#" className="hover:bg-gray-400 rounded py-2 px-4 mx-2">
                Sports
              </a>
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
