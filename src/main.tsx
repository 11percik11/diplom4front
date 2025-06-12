import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { store } from "./app/store"
import "./index.css"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Register from "./components/register"
import Home from "./components/home"
import { Layout } from "./components/Layout"
import LoginForm from "./components/auth"
import CartPage from "./components/Cart"
import { ProfileId } from "./components/profileID"
import { MyProduct } from "./components/myProduct"
import { Tovar } from "./components/tovar"
import Profile from "./components/profile"
import Admin from "./components/Admin/Admin"
import AdminPanel from "./components/AdminPanel/AdminPanel"
import EmailConfirmationPage from "./components/Activeted/Activated"
import VisableComment from "./components/VisableComment/VisableComment"
import PaymentComplete from "./components/PaymentComplete/PaymentComplete"
import OrdersPage from "./components/OrdersPage/OrdersPage"
import ManageOrdersPage from "./components/OrderWork/OrderWork"
import CreateDiscount from "./components/Discount/Discount"

const container = document.getElementById("root")!
const root = createRoot(container)
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/product/:id",
        element: <Tovar />,
      },
      {
        path: "/myproduct",
        element: <MyProduct />,
      },
      {
        path: "/discount",
        element: <CreateDiscount />,
      },
      
      {
        path: "/profile/:id",
        element: <ProfileId />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/adminpanel",
        element: <AdminPanel />,
      },
      {
        path: "/commentvisable",
        element: <VisableComment />,
      },
      {
        path: "/manage-orders",
        element: <ManageOrdersPage />,
      },
      {
        path: "/orders",
        element: <OrdersPage />,
      },
      {
        path: "/auther",
        element: <LoginForm />,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/active/:id",
    element: <EmailConfirmationPage />,
  },
  {
    path: "/payment-complete",
    element: <PaymentComplete />,
  },
])

root.render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>,
)