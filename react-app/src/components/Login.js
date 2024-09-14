import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Nav from "./Nav";

function SignIn() {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            alt="Your Company"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          {!isAuthenticated && (
            <div>
              {/* Auth0 login button */}
              <button
                onClick={() => loginWithRedirect()}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in with Auth0
              </button>
            </div>
          )}

          {isAuthenticated && (
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">You are logged in.</p>
              <button
                onClick={() => logout()}
                className="mt-4 flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default SignIn;
