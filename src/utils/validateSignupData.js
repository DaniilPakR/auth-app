export default function validateSignupData(
  authData,
  passwordConfirmation,
  dataSharing,
  userLicense,
  ageConsent
) {
  if (!authData.name) {
    return new Response(
      JSON.stringify({
        message: "Name is missing. Please enter your name.",
      }),
      {
        status: 422,
        headers: { "Content-Type": "application/json" },
      }
    );
  } else if (!authData.surname) {
    return new Response(
      JSON.stringify({
        message: "Surname is missing. Please enter your surname.",
      }),
      {
        status: 422,
        headers: { "Content-Type": "application/json" },
      }
    );
  } else if (!authData.email) {
    return new Response(
      JSON.stringify({
        message: "Email is missing. Please enter an email.",
      }),
      {
        status: 422,
        headers: { "Content-Type": "application/json" },
      }
    );
  } else if (
    !/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(authData.email)
  ) {
    return new Response(
      JSON.stringify({
        message: "Incorrect email format.",
      }),
      {
        status: 422,
        headers: { "Content-Type": "application/json" },
      }
    );
  } else if (!authData.password) {
    return new Response(
      JSON.stringify({
        message: "Password is missing. Please enter a password.",
      }),
      {
        status: 422,
        headers: { "Content-Type": "application/json" },
      }
    );
  } else if (authData.password !== passwordConfirmation) {
    return new Response(
      JSON.stringify({
        message:
          "Passwords don't match. Please make sure your passwords match.",
      }),
      {
        status: 422,
        headers: { "Content-Type": "application/json" },
      }
    );
  } else if (!dataSharing || !userLicense || !ageConsent) {
    return new Response(
      JSON.stringify({
        message: "Please check all the required checkboxes.",
      }),
      {
        status: 422,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
