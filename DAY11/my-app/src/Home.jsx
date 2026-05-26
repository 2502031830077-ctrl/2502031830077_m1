import { useNavigate } from "react-router-dom"

export default function Home() {
  const navigate = useNavigate();
  const goToUser = () => {
    navigate("/about");

  }
  return (
    <div>
      <p>Welcome to the Home page.</p>
      <button onClick={goToUser}>Go to User Page</button>
    </div>
  )
}

