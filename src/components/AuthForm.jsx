import { useState } from "react";
import { Form, Link, useSearchParams } from "react-router-dom";

export default function AuthForm() {
  const [searchParams] = useSearchParams();
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [checkboxes, setCheckboxes] = useState({
    dataSharing: false,
    userLicense: false,
    ageConsent: false,
  });

  const mode = searchParams.get("mode");
  const linkText = mode === "login" ? "Don't have an account? Sign up!" : "Already have an Account? Log in!";

  const handleIndividualCheck = (checkbox) => {
    setCheckboxes((prev) => {
      const updated = { ...prev, [checkbox]: !prev[checkbox] };
      const allChecked = Object.values(updated).every((val) => val);
      setIsAllChecked(allChecked);
      return updated;
    });
  };

  const handleSelectAll = () => {
    const newState = !isAllChecked;
    setIsAllChecked(newState);
    setCheckboxes({
      dataSharing: newState,
      userLicense: newState,
      ageConsent: newState,
    });
  };

  return (
    <div className="w-96 p-8 bg-white rounded-lg shadow-lg">
      <Form method="post">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">{mode === "login" ? "Login" : "Sign Up"}</h2>

        <p className="flex flex-col mb-4">
          <label htmlFor="email" className="text-gray-800">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </p>

        <p className="flex flex-col mb-4">
          <label htmlFor="password" className="text-gray-800">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </p>

        {mode === "signup" && (
          <p className="flex flex-col mb-6">
            <label htmlFor="passwordConfirmation" className="text-gray-800">Confirm Password</label>
            <input
              type="password"
              id="passwordConfirmation"
              name="passwordConfirmation"
              required
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </p>
        )}

        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isAllChecked}
              onChange={handleSelectAll}
              className="mr-2"
            />
            Select All
          </label>
          <div className="flex flex-col">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={checkboxes.dataSharing}
                onChange={() => handleIndividualCheck("dataSharing")}
                className="mr-2"
              />
              I agree to share my data
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={checkboxes.userLicense}
                onChange={() => handleIndividualCheck("userLicense")}
                className="mr-2"
              />
              I agree to user's license
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={checkboxes.ageConsent}
                onChange={() => handleIndividualCheck("ageConsent")}
                className="mr-2"
              />
              I am 18 years old or older
            </label>
          </div>
          <button
            type="button"
            onClick={() => {
              setCheckboxes({ dataSharing: false, userLicense: false, ageConsent: false });
              setIsAllChecked(false);
            }}
            className="mt-2 text-red-500 hover:underline"
          >
            Delete All Selections
          </button>
        </div>

        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
        >
          {mode === "login" ? "Login" : "Sign Up"}
        </button>

        <Link to={`?mode=${mode === "login" ? "signup" : "login"}`} className="text-blue-500 mt-4 block text-center">
          {linkText}
        </Link>
      </Form>
    </div>
  );
}
