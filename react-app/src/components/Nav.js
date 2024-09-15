// ./react-app/src/components/Nav.js
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Login from "./Login";
import Cookies from 'js-cookie';

function Nav() {
  const location = useLocation();

  const isSessionSet = () => {
    return Cookies.get('jwt_payload') !== undefined;
  };
  const isAuthenticated = isSessionSet();

  return (
    <nav className="w-full py-4 bg-blue-800 shadow">
      <div className="w-full container mx-auto flex flex-wrap items-center justify-between">
        <ul className="flex items-center justify-between font-bold text-sm text-white uppercase no-underline">
          {location.pathname !== "/" && (
            <li>
              <Link className="hover:text-gray-200 hover:underline px-4" to="/">
                Home
              </Link>
            </li>
          )}
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
          {!isAuthenticated ? (
            <div className="flex gap-3">
              <Link
                to="/login"
                className="bg-white text-blue-800 hover:bg-gray-200 text-sm font-bold py-2 px-4 rounded"
              >
                <Login />
              </Link>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex justify-center items-center">
                <Link to="/profile">
                  <img
                    className="w-10 h-10 rounded-full"
                    src={
                      "https://philanthropyhackathon.s3.amazonaws.com/profile_pics/1.jpeg"
                    }
                  />
                </Link>
              </div>
              <button
                // onClick={() => logout({ returnTo: window.location.origin })}
                className="ml-4 bg-red-600 text-white px-3 py-1 rounded"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Nav;
