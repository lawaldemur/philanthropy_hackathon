import React from "react";
import axios from 'axios';

function Modal({ selectedPost, closeModal }) {

  const sendEmail = async () => {
    const recipientEmail = selectedPost?.email; // Assuming selectedPost is already defined in your state

    if (!recipientEmail) {
      alert('Email not found!');
      return;
    }

    try {
      // Send a POST request to the Flask endpoint
      const response = await axios.post(`http://localhost:8000/send-email/${recipientEmail}`);
      if (response.status === 200) {
        alert('Email sent successfully!');
      } else {
        alert('Failed to send email.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('There was an error sending the email.');
    } finally {
      closeModal();  // Assuming closeModal is a function to close the modal
    }
  };


  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
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
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {selectedPost?.category_id}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {selectedPost?.image_url}
                  </p>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {selectedPost?.date_created}
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

            <a href={"mailto:"+selectedPost?.email}>
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={closeModal}
            >
              Email
            </button>
            </a>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
