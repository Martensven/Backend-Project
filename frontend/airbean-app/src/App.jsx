import Header from './components/header'
import './App.css'
import { Routes, Route } from 'react-router-dom';
import { About } from './components/about';
import { Login } from './components/login';
import { Register } from './components/register';
import { Order } from './components/order';
import { Items } from './components/items';
import { Cart } from './components/cart';

function App() {


  return (

    <>
      <Header />
      <Routes>
        <Route path="/" element={<About />}></Route>
        <Route path="/items" element={<Items />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/order" element={<Order />}></Route>
        <Route path="/cart" element={<Cart />}></Route>
      </Routes>

    </>

  )
}

export default App
