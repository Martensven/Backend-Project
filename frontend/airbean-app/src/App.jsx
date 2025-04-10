import Header from './components/header'
import './App.css'
import { Routes, Route } from 'react-router-dom';
import { About } from './components/about';
import { Login } from './components/login';
import { Register } from './components/register';
import { ItemList } from './components/ItemList.jsx';
import { Cart } from './components/cart';
import { AuthProvider } from './components/context/AuthContext';
import { ToastContainer } from 'react-toastify';
import { CreateOrder } from './components/createorder.jsx';
import OrderList from './components/order.jsx'



function App() {


  return (

    <>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<About />}></Route>
          <Route path="/items" element={<ItemList />}></Route>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/register" element={<Register />}></Route>
          <Route path="/orders" element={<OrderList />} />
          <Route path="/create-order" element={<CreateOrder />} />
          <Route path="/cart" element={<Cart />}></Route>
        </Routes>
        <ToastContainer position="top-right" autoClose={2000} />
      </AuthProvider>

    </>

  )
}

export default App
