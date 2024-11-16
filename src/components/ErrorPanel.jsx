export function ErrorPanel({ error }) {
  if (!error.visible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-96 bg-red-500 text-white p-4 rounded-md shadow-lg flex justify-between items-center">
      <p>{error.message}</p>
      <button
        onClick={() => (error.visible = false)}
        className="text-white hover:text-gray-200 focus:outline-none"
      >
        &#10005;
      </button>
    </div>
  );
}
