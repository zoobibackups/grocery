import { Suspense,useEffect,useState } from 'react';
import { Route,Routes } from "react-router-dom";
import MainContainer from "./components/MainContainer";
import Header from "./components/header/Header";
import NewUserModal from "./components/newusermodal/NewUserModal";

import { AnimatePresence } from "framer-motion";
import { useDispatch,useSelector } from 'react-redux';
import Cookies from 'universal-cookie';
import api from './api/api';
import { Footer } from "./components/footer/Footer";
import ProfileDashboard from './components/profile/ProfileDashboard';
import { ActionTypes } from './model/action-type';

//react-toast
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ViewCart from './components/cart/ViewCart';
import ShowAllCategories from './components/category/ShowAllCategories';
import Checkout from './components/checkout/Checkout';
import Wishlist from './components/favorite/Wishlist';
import ProductDetails from './components/product/ProductDetails';
import ProductList from './components/product/ProductList';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import NotFound from './components/404/NotFound';
import About from './components/about/About';
import BrandList from './components/brands/BrandList';
import Contact from './components/contact/Contact';
import FAQ from './components/faq/FAQ';
import Loader from './components/loader/Loader';
import Notification from './components/notification/Notification';
import OrderDetails from './components/order/OrderDetails';
import Policy from './components/policy/Policy';
import ScrollTop from './components/scrolltoTop/ScrollTop';
import Terms from './components/terms/Terms';

function App() {
  //initialize cookies
  const cookies = new Cookies();

  const dispatch = useDispatch();

  const setting = useSelector(state => (state.setting))

  const city = useSelector(state => (state.city))
  const user = useSelector(state => (state.user))
  const cart = useSelector(state => (state.cart))
  const language = useSelector((state) => (state.language))
 
  useEffect(() => {
    if (cookies.get('jwt_token') !== undefined) {
      getCurrentUser(cookies.get('jwt_token'));
    } else {
      dispatch({ type: ActionTypes.LOGOUT_AUTH, payload: null });
    }
    getSetting()
  }, [])

  useEffect(() => {
    api.getSystemLanguage(0, 1)
      .then(response => response.json())
      .then(result => {
        console.log(result,  "result");
        document.documentElement.dir = result?.data.type;
         if (result.status === 1) {
          if (!language.current_language) {
            dispatch({ type: ActionTypes.SET_LANGUAGE, payload: result.data })

          } else {
            document.documentElement.dir = language.current_language.type ? language.current_language.type : "LTR"
    //        document.documentElement.dir =  "LTR"
          }
          // document.documentElement.dir = result.data.type;
        }
      })
  }, [])


  let translateFile = typeof (language.current_language?.json_data) === "object" ? language.current_language?.json_data : language.current_language?.json_data[0]

  i18next.use(initReactI18next)
    .init({
      resources: {
        en: { translation: translateFile }
      },
      lng: language.current_language?.code,
      fallbackLng: "en",
    });


  const getCurrentUser = (token) => {
    api.getUser(token)
      .then(response => response.json())
      .then(result => {
        if (result.status === 1) {
          dispatch({ type: ActionTypes.SET_CURRENT_USER, payload: result.user });
        }
      })
  }
  //fetching app-settings
  const getSetting = async () => {
    await api.getSettings().then(response => response.json())
      .then(result => {
        if (result.status === 1) {
          dispatch({ type: ActionTypes.SET_SETTING, payload: result.data })
        }
      })
      .catch(error => console.log(error))
  }

  useEffect(() => {
    const fetchShop = (city_id, latitude, longitude) => {
      api.getShop(city_id, latitude, longitude, cookies.get('jwt_token'))
        .then(response => response.json())
        .then(result => {
          if (result.status === 1) {

            dispatch({ type: ActionTypes.SET_SHOP, payload: result.data })
          }
        })

    }
    if (city.city !== null) {
      fetchShop(city.city.id, city.city.latitude, city.city.longitude);
    }
  }, [city, cart])


  useEffect(() => {
    document.title = setting.setting ? setting.setting.web_settings.site_title : "Loading..."
    var link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = setting.setting && setting.setting.web_settings.favicon;
  });



  const RootCss = `
  :root {
    --body-background: #f7f7f7;
    --container-bg: #f2f3f9;
    --primary-color: #141a1f;
    --secondary-color: ${setting.setting && setting.setting.web_settings.color}; 
    --secondary-color-light: ${setting.setting && setting.setting.web_settings.light_color};
    --secondary-color-dark:${setting.setting && setting.setting.web_settings.dark_color};
    --sub-text-color: #8b8b8b;
    --second-cards-color: #ffffff;
    --text-field-color: #f8f8f8;
  
    --body-background-dark: #141414;
    --primary-color-dark: #e5e5e5;
    --gray-hover-color: #dcdcdc;
    --bg-danger: rgba(209, 31, 31, 0.3);
  }
  input[type="radio"]:checked {
    background-color: var(--secondary-color); /* Change background color when checked */
    padding: 3px;
    border: 3px solid #fff;
  }
  input[type="radio"] {
    appearance: none;
    width: 13px;
    margin: auto;
    height: 13px;
    border-radius: 50%;
    border: 1px solid;
    outline: none;
}
  `

  useEffect(() => {
    dispatch({ type: ActionTypes.SET_CART_PROMO, payload: null })
  }, [cart.cart])

  return (
    <>



      <AnimatePresence>
        <style>{RootCss}</style>
        <div className="h-auto">

          <Header />

          <NewUserModal />
          {
            <>

              <main id='main' className="main-app">
                <Suspense fallback={<Loader screen={"full"} />} >
                  <Routes >
                    {/* {user.user && user.user} */}
                    {user.user ?
                      <>
                        <Route exact={true} path="/cart" element={<ViewCart />}></Route>
                        <Route exact={true} path="/checkout" element={<Checkout />}></Route>
                        <Route exact={true} path='/wishlist' element={<Wishlist />}></Route>
                        <Route exact={true} path="/profile" element={<ProfileDashboard />}></Route>
                        <Route exact={true} path="/profile/orders" element={<ProfileDashboard showOrders={true} />}></Route>
                        <Route exact={true} path="/profile/orders/:id" element={<OrderDetails />}></Route>
                        <Route exact={true} path="/profile/transactions" element={<ProfileDashboard showTransaction={true} />}></Route>
                        <Route exact={true} path="/profile/address" element={<ProfileDashboard showAddress={true} />}></Route>
                        <Route exact={true} path="/notification" element={<Notification />}></Route>
                        <Route exact={true} path='/categories' element={<ShowAllCategories />}></Route>
                        <Route exact={true} path='/products' element={<ProductList />}></Route>
                        <Route exact={true} path='/product' element={<ProductDetails />}></Route>
                        <Route exact={true} path='/product/:slug' element={<ProductDetails />}></Route>
                        <Route exact={true} path='/about' element={<About />}></Route>
                        <Route exact={true} path='/contact' element={<Contact />}></Route>
                        <Route exact={true} path='/faq' element={<FAQ />}></Route>
                        <Route exact={true} path='/terms' element={<Terms />}></Route>
                        <Route exact={true} path='/policy/:policy_type' element={<Policy />}></Route>
                        <Route exact={true} path="" element={<MainContainer />}></Route>
                        <Route exact={true} path='/brands' element={<BrandList />} />
                      </>
                      :
                      <>

                        <Route exact={true} path='/categories' element={<ShowAllCategories />}></Route>
                        <Route exact={true} path='/brands' element={<BrandList />} />
                        <Route exact={true} path='/products' element={<ProductList />}></Route>
                        <Route exact={true} path='/product' element={<ProductDetails />}></Route>
                        <Route exact={true} path='/product/:slug' element={<ProductDetails />}></Route>
                        <Route exact={true} path='/about' element={<About />}></Route>
                        <Route exact={true} path='/contact' element={<Contact />}></Route>
                        <Route exact={true} path='/faq' element={<FAQ />}></Route>
                        <Route exact={true} path='/terms' element={<Terms />}></Route>
                        <Route exact={true} path='/policy/:policy_type' element={<Policy />}></Route>
                        <Route exact={true} path="" element={<MainContainer />}></Route>
                      </>
                    }

                    <Route exact={true} path='*' element={<NotFound />}></Route>

                  </Routes>
                </Suspense>


                <ScrollTop></ScrollTop>
              </main>
            </>
          }
          <Footer />


          <ToastContainer toastClassName='toast-container-class' />
        </div>
      </AnimatePresence>
    </>
  );
}

export default App;