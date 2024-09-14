import React from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";


function Nav() {
  const { isAuthenticated } = useAuth0();

  return (
    <nav className="w-full py-4 bg-blue-800 shadow">
      <div className="w-full container mx-auto flex flex-wrap items-center justify-between">
        <ul className="flex items-center justify-between font-bold text-sm text-white uppercase no-underline">
          <li>
            <Link className="hover:text-gray-200 hover:underline px-4" to="/">
              Home
            </Link>
          </li>
        </ul>

        <div className="flex items-center text-lg no-underline text-white pr-6">
          <a href="#">
            <i className="fab fa-facebook"></i>
          </a>
          <a className="pl-6" href="#">
            <i className="fab fa-instagram"></i>
          </a>
          <a className="pl-6" href="#">
            <i className="fab fa-twitter"></i>
          </a>
          <a className="pl-6" href="#">
            <i className="fab fa-linkedin"></i>
          </a>
        </div>

        
        <div className="flex items-center space-x-6 text-lg text-white pr-6">
        {isAuthenticated ? <div className="flex gap-3">
            <Link
              to="/login"
              className="bg-white text-blue-800 hover:bg-gray-200 text-sm font-bold py-2 px-4 rounded"
            >
              Log In
            </Link>
          </div>
          :
          <div className="flex items-center">
            <div className="w-10 h-10 bg-yellow-500 rounded-full flex justify-center items-center">
              <Link to="/profile">
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="text-brown"
                >
                  <circle cx="12" cy="8" r="4" fill="currentColor"></circle>
                  <path
                    d="M21 21C21 25.4183 18.4183 29 12 29C5.58172 29 3 25.4183 3 21C3 16.5817 5.58172 13 12 13C18.4183 13 21 16.5817 21 21Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </Link>
            </div>
          </div>
        }
        </div>
      </div>
    </nav>
  );
}

export default Nav;
