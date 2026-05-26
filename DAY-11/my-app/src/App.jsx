// import Counter from './Counter'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import About from './About';
import Contact from './Contact';
import User from './User';
import Product from './Product';

function App() {
  function NotFound() {
    return (
      <div>
        <h1>404 Not Found</h1>
      </div>
    )
  }
  return (
    <>
      <BrowserRouter>
        <h1>React Router</h1>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/user/10">User</Link>
          <Link to="/product">Product</Link>
          
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/user/:id" element={<User />} />
          <Route path="/product" element={<Product />} />
          <Route path="*" element={<NotFound />} />
          
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App

