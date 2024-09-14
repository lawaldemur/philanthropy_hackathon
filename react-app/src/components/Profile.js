import React from "react";
import { Link } from "react-router-dom";
import Nav from "./Nav";

function Profile() {
  return (
    <main className="app">
      <Nav />
      {/* Profile Content */}
      <div className="bg-white flex flex-col w-full p-6">
        {/* Banner Image */}
        <div className="relative h-40 w-full mb-4">
          <img
            src="https://static.bandana.co/users/profile/default/default.jpg"
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
                src="https://static.bandana.co/users/profile/default/default.jpg"
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">Qiming Liu</h2>
              <p className="text-gray-500">annisyfft@gmail.com</p>
            </div>
            <button className="bg-yellow-500 text-brown px-4 py-2 rounded mt-4">
              Edit Profile
            </button>
          </div>

          {/* Profile Checklist */}
          <div className="w-full md:w-2/3 bg-gray-100 p-6 rounded-lg">
            <h3 className="text-lg font-bold mb-4">2/3 Tasks Left</h3>
            <div className="bg-yellow-500 h-2 w-1/3 mb-4"></div>
            <ul className="space-y-2">
              <li className="flex items-center justify-between">
                <span>Add your phone number</span>
                <button className="text-yellow-500 hover:underline">Add</button>
              </li>
              <li className="flex items-center justify-between">
                <span>Add your location</span>
                <button className="text-yellow-500 hover:underline">Add</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
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
