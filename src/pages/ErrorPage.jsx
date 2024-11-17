import { Link } from "react-router-dom"

export default function ErrorPage() {
  return (
    <div className='w-96 p-8 bg-white rounded-lg shadow-lg flex flex-col items-center'>
      <h1 className='text-2xl font-semibold text-gray-800 mb-6'>An error occured!</h1>
      <p className='text-2xl font-semibold text-gray-800 mb-6'>Page doesn't exist</p>
      <Link to='/' className='text-xl text-gray-800 mt-2 block text-center underline'>Go to Home Page</Link>
    </div>
  )
}