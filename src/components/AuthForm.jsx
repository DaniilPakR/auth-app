import { useState, useEffect } from "react";
import { Form, Link, useSearchParams, useActionData, useNavigation } from "react-router-dom";

export default function AuthForm() {
  const data = useActionData();
  const [dataForErrors, setDataForErrors] = useState()
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [checkboxes, setCheckboxes] = useState({
    dataSharing: false,
    userLicense: false,
    ageConsent: false,
  });
  const [errorIsShown, setErrorIsShown] = useState(false);

  useEffect(() => {
    setDataForErrors(data);
    setErrorIsShown(true)
    const timer = setTimeout(() => {
      setErrorIsShown(false)
    }, 2500)
    return () => {
      clearTimeout(timer);
    };
  }, [data]);

  const mode = searchParams.get("mode");
  const linkText =
    mode === "login"
      ? "Don't have an account? Sign up!"
      : "Already have an Account? Log in!";

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

  const isSubmitting = navigation.state === "submitting"

  return (
    <div className="w-96 p-8 bg-white rounded-lg shadow-lg">
      <Form method={`${mode === "signup" ? "post" : "patch"}`}>
        <div className="flex flex-row justify-between">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            {mode === "login" ? "Login" : "Sign Up"}
          </h2>
          <Link to="/" className="text-blue-500 mt-2 block text-center">
            Go Back
          </Link>
        </div>
        {errorIsShown && dataForErrors && (
          <div className="mb-4 p-3 rounded-md bg-red-100 border border-red-500 text-red-700">
            <p>{dataForErrors.message}</p>
          </div>
        )}

        {mode === "signup" && (
          <div className="names flex flex-row">
            <p className="flex flex-col mb-4">
              <label htmlFor="name" className="text-gray-800">
                Name
              </label>
              <input
                type="name"
                id="name"
                name="name"
                className="mr-7 w-36 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </p>
            <p className="flex flex-col mb-4">
              <label htmlFor="surname" className="text-gray-800">
                Surname
              </label>
              <input
                type="surname"
                id="surname"
                name="surname"
                className="w-36 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </p>
          </div>
        )}
        <p className="flex flex-col mb-4">
          <label htmlFor="email" className="text-gray-800">
            Email
          </label>
          <input
            type="text"
            id="email"
            name="email"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </p>

        <p className="flex flex-col mb-4">
          <label htmlFor="password" className="text-gray-800">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </p>

        {mode === "signup" && (
          <p className="flex flex-col mb-6">
            <label htmlFor="passwordConfirmation" className="text-gray-800">
              Confirm Password
            </label>
            <input
              type="password"
              id="passwordConfirmation"
              name="passwordConfirmation"
              className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </p>
        )}

        {mode === "signup" && (
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
                  name="dataSharing"
                />
                I agree to share my data
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={checkboxes.userLicense}
                  onChange={() => handleIndividualCheck("userLicense")}
                  className="mr-2"
                  name="userLicense"
                />
                I agree to user's license
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={checkboxes.ageConsent}
                  onChange={() => handleIndividualCheck("ageConsent")}
                  className="mr-2"
                  name="ageConsent"
                />
                I am 18 years old or older
              </label>
            </div>
            <button
              type="button"
              onClick={() => {
                setCheckboxes({
                  dataSharing: false,
                  userLicense: false,
                  ageConsent: false,
                });
                setIsAllChecked(false);
              }}
              className="mt-2 text-red-500 hover:underline"
            >
              Delete All Selections
            </button>
          </div>
        )}

        <button
          type="submit"
          className={`w-full p-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 ${isSubmitting && 'pointer-events-none'}`}
        >
          {isSubmitting ? "Submitting..." : mode === "login" ? "Login" : "Sign Up"}
        </button>

        <Link
          to={`?mode=${mode === "login" ? "signup" : "login"}`}
          className="text-blue-500 mt-4 block text-center"
          
        >
          {linkText}
        </Link>
      </Form>
    </div>
  );
}
