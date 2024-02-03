import React, { useEffect, useState } from 'react'
import './product.css'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import { BsHeart, BsPlus, BsHeartFill } from "react-icons/bs";
import { BiMinus, BiLink } from 'react-icons/bi'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { toast } from 'react-toastify'
import api from '../../api/api';
import Cookies from 'universal-cookie'
import { useDispatch, useSelector } from 'react-redux';
import { ActionTypes } from '../../model/action-type';
import { FacebookIcon, FacebookShareButton, TelegramIcon, TelegramShareButton, WhatsappIcon, WhatsappShareButton } from 'react-share';
import Loader from '../loader/Loader';
import Slider from 'react-slick';
import { useTranslation } from 'react-i18next';



const QuickViewModal = (props) => {
    const setting = useSelector(state => state.setting)



    const cookies = new Cookies()
    const dispatch = useDispatch()

    const city = useSelector(state => state.city);
    const sizes = useSelector(state => state.productSizes);

    const cart = useSelector(state => state.cart)
    const favorite = useSelector(state => state.favorite)



    useEffect(() => {
        return () => {
            props.setselectedProduct({})
            setproductcategory({})
            setproductbrand({})
            setproduct({})
        };
    }, [])


    const fetchProduct = async (product_id) => {
        await api.getProductbyId(city.city.latitude, city.city.longitude, product_id, cookies.get('jwt_token'))
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    setproduct(result.data)
                    !variant_index && setVariantIndex(result.data.variants?.length > 0 && result.data.variants[0]?.id)
                    setmainimage(result.data.image_url)
                    selectedVariant && setSelectedVariant(result.data.variants?.length > 0 && result.data.variants.find((element)=> element.id == variant_index))
                }
            })
            .catch(error => console.log(error))
    }

    useEffect(() => {

        if (Object.keys(props.selectedProduct).length > 0 && city.city !== null) {
            fetchProduct(props.selectedProduct.id);

            getCategoryDetails()
            getBrandDetails()
        }
    }, [props.selectedProduct, city, cart])

    useEffect(() => {
        if (sizes.sizes === null || sizes.status === 'loading') {
            if (city.city !== null) {
                api.getProductbyFilter(city.city.id, city.city.latitude, city.city.longitude, cookies.get('jwt_token'))
                    .then(response => response.json())
                    .then(result => {
                        if (result.status === 1) {
                            setproductSizes(result.sizes)
                            dispatch({ type: ActionTypes.SET_PRODUCT_SIZES, payload: result.sizes })
                        }
                    })
            }
        }
        else {
            setproductSizes(sizes.sizes)
        }
    }, [city, sizes, cart])

    const [mainimage, setmainimage] = useState("")
    const [productcategory, setproductcategory] = useState({})
    const [productbrand, setproductbrand] = useState({})
    const [product, setproduct] = useState({})
    const [productSizes, setproductSizes] = useState(null)
    const [isLoader, setisLoader] = useState(false)
    const [variant_index, setVariantIndex] = useState(null)
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(0)




    const getCategoryDetails = () => {
        api.getCategory()
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    result.data.forEach(ctg => {
                        if (ctg.id === props.selectedProduct.category_id) {
                            setproductcategory(ctg);
                        }
                    });
                }
            })
            .catch((error) => console.log(error))
    }

    const getBrandDetails = () => {
        api.getBrands()
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    result.data.forEach(brnd => {
                        if (brnd.id === props.selectedProduct.brand_id) {
                            setproductbrand(brnd);
                        }
                    });
                }
            })
            .catch((error) => console.log(error))
    }


    //Add to Cart
    const addtoCart = async (product_id, product_variant_id, qty) => {
        setisLoader(true)
        await api.addToCart(cookies.get('jwt_token'), product_id, product_variant_id, qty)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message)
                    await api.getCart(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
                        .then(resp => resp.json())
                        .then(res => {
                            if (res.status === 1)
                                dispatch({ type: ActionTypes.SET_CART, payload: res })
                        })

                }
                else {
                    toast.error(result.message)
                }
            })
    }

    //remove from Cart
    const removefromCart = async (product_id, product_variant_id) => {
        setisLoader(true)
        await api.removeFromCart(cookies.get('jwt_token'), product_id, product_variant_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message)
                    await api.getCart(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
                        .then(resp => resp.json())
                        .then(res => {

                            if (res.status === 1)
                                dispatch({ type: ActionTypes.SET_CART, payload: res })
                            else
                                dispatch({ type: ActionTypes.SET_CART, payload: null })
                        })

                }
                else {
                    toast.error(result.message)
                }
            })
    }

    //Add to favorite
    const addToFavorite = async (product_id) => {
        setisLoader(true)

        await api.addToFavotite(cookies.get('jwt_token'), product_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message)
                    await api.getFavorite(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
                        .then(resp => resp.json())
                        .then(res => {
                            setisLoader(false)
                            if (res.status === 1)
                                dispatch({ type: ActionTypes.SET_FAVORITE, payload: res })
                        })
                }
                else {
                    setisLoader(false)
                    toast.error(result.message)
                }
            })
    }
    const removefromFavorite = async (product_id) => {
        await api.removeFromFavorite(cookies.get('jwt_token'), product_id)
            .then(response => response.json())
            .then(async (result) => {
                if (result.status === 1) {
                    toast.success(result.message)
                    await api.getFavorite(cookies.get('jwt_token'), city.city.latitude, city.city.longitude)
                        .then(resp => resp.json())
                        .then(res => {
                            if (res.status === 1)
                                dispatch({ type: ActionTypes.SET_FAVORITE, payload: res })
                            else
                                dispatch({ type: ActionTypes.SET_FAVORITE, payload: null })
                        })
                }
                else {
                    toast.error(result.message)
                }
            })
    }
    const settings_subImage = {

        infinite: false,
        slidesToShow: 3,
        initialSlide: 0,
        // centerMargin: "10px",
        margin: "20px",
        prevArrow: (
            <button
                type="button"
                className="slick-prev"
                onClick={(e) => {
                    setmainimage(e.target.value);
                }}
            >
                <FaChevronLeft size={30} className="prev-arrow" />
            </button>
        ),
        nextArrow: (
            <button
                type="button"
                className="slick-next"
                onClick={(e) => {
                    setmainimage(e.target.value);
                }}
            >
                <FaChevronRight color="#f7f7f7" size={30} className="next-arrow" />
            </button>
        ),
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                    infinite: true,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                },
            },
        ],
    }
    const handleVariantChange = (variant, index) => {
        setSelectedVariant(variant);
        setVariantIndex(index)
    };

    const { t } = useTranslation();

    const placeHolderImage = (e) => {

        e.target.src = setting.setting?.web_logo
    }
    return (
        <div className='product-details-view'>
            <div className="modal fade" id="quickviewModal" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="loginLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content" style={{ borderRadius: "10px", minWidth: "80vw" }}>

                        <div className="d-flex flex-row justify-content-end header">
                            <button type="button" data-bs-dismiss="modal" aria-label="Close" onClick={() => {
                                props.setselectedProduct({})
                                setproductcategory({})
                                setproductbrand({})
                                setproduct({})
                                setSelectedVariant(null)
                                setQuantity(0)
                                setVariantIndex(0)
                            }} className="bg-white"><AiOutlineCloseCircle size={30} /></button>
                        </div>

                        <div className="modal-body">
                            {Object.keys(product).length === 0 || productSizes === null
                                ? (
                                    <Loader />
                                )
                                : (
                                    <div className="top-wrapper">

                                        <div className='row body-wrapper'>
                                            <div className="col-xl-4 col-lg-6 col-md-12 col-12">
                                                <div className='image-wrapper'>
                                                    <div className='main-image col-12 border'>
                                                        <img onError={placeHolderImage} src={mainimage} alt='main-product' className='col-12' style={{ width: '85%' }} />
                                                    </div>


                                                    <div className='sub-images-container row'>


                                                        {product.images.length >= 4 ?
                                                            <>
                                                                <Slider {...settings_subImage}>
                                                                    {product.images.map((image, index) => (
                                                                        <div key={index} >
                                                                            <div className={`sub-image border ${mainimage === image ? 'active' : ''}`}>

                                                                                <img onError={placeHolderImage} src={image} className='col-12' alt="product" onClick={() => {
                                                                                    setmainimage(image)
                                                                                }}></img>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </Slider>


                                                            </> :
                                                            <>
                                                                {product.images.map((image, index) => (
                                                                    <div key={index} className={`sub-image border ${mainimage === image ? 'active' : ''}`}>
                                                                        <img onError={placeHolderImage} src={image} className='col-12 ' alt="product" onClick={() => {
                                                                            setmainimage(image)
                                                                        }}></img>
                                                                    </div>
                                                                ))}
                                                            </>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xl-8 col-lg-6 col-md-12 col-12">

                                                <div className='detail-wrapper'>
                                                    <div className='top-section'>
                                                        <p className='product_name'>{product.name}</p>
                                                        {/* <div className='product-brand'>

                                                            {Object.keys(productbrand).length === 0
                                                                ? null
                                                                : (
                                                                    <div className='product-brand'>
                                                                        <span className='brand-title'>{t("brand")}:</span>
                                                                        <span className='brand-name'>
                                                                            {productbrand.name}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                        </div> */}
                                                        <div className="d-flex flex-row gap-2 align-items-center my-1">

                                                            <div id="price-section-quickview" className='d-flex flex-row gap-2 align-items-center my-1'>
                                                                {setting.setting && setting.setting.currency}<p id='fa-rupee' className='m-0'>{selectedVariant ? (selectedVariant.discounted_price === 0 ? selectedVariant.price.toFixed(setting.setting && setting.setting.decimal_point) : selectedVariant.discounted_price.toFixed(setting.setting && setting.setting.decimal_point)) : (product.variants[0].discounted_price === 0 ? product.variants[0].price.toFixed(setting.setting && setting.setting.decimal_point) : product.variants[0].discounted_price.toFixed(setting.setting && setting.setting.decimal_point))}</p>
                                                            </div>
                                                        </div>




                                                    </div>
                                                    <div className='bottom-section'>
                                                        {/* <p>{t("product_variants")}</p> */}


                                                        <div className='d-flex gap-3 bottom-section-content '>

                                                            <input type="hidden" id="productdetail-selected-variant-id" name="variant" value={selectedVariant ? selectedVariant.id : product.variants[0].id} />
                                                            <div className="variants">
                                                                <div className="row">

                                                                    {/* <input type="hidden" name="" value={product.variants[0].id} id='quickview-selected-variant-id' /> */}
                                                                    {product.variants.map((variant, index) => {
                                                                        return (
                                                                            <>
                                                                                <div className="variant-section col-2">
                                                                                    <div className={`variant-element ${variant_index === variant.id ? 'active' : ''} ${Number(product.is_unlimited_stock) ? "" : (!variant.status ? "out_of_stock" : "")}`} key={index}>
                                                                                        <label className="element_container " htmlFor={`variants${index}`}>
                                                                                            <div className="top-section">

                                                                                                <input type="radio" name={`variants${index}`} id={`variants${index}`} checked={variant_index === variant.id} disabled={Number(product.is_unlimited_stock) ? false : (variant.cart_count >= variant.stock ? true : false)} onChange={() => handleVariantChange(variant, variant.id)} />
                                                                                            </div>
                                                                                            <div className="bottom-section">
                                                                                                <span className="d-flex align-items-center flex-column">{variant.measurement} {variant.stock_unit_name} </span>
                                                                                            </div>
                                                                                        </label>
                                                                                    </div>

                                                                                </div>
                                                                            </>

                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>




                                                        </div>
                                                        {
                                                            selectedVariant ? (selectedVariant.cart_count >= 1 ? <>
                                                                <div id={`input-cart-quickview`} className="input-to-cart">
                                                                    <button type='button' onClick={() => {

                                                                        if (selectedVariant.cart_count === 1) {

                                                                            removefromCart(product.id, selectedVariant.id)
                                                                        }
                                                                        else {
                                                                            addtoCart(product.id, selectedVariant.id, selectedVariant.cart_count - 1)

                                                                        }

                                                                    }} className="wishlist-button"><BiMinus fill='#fff' /></button>
                                                                    <span id={`input-quickview`} >{selectedVariant.cart_count}</span>
                                                                    <button type='button' onClick={() => {

                                                                        if (Number(product.is_unlimited_stock)) {
                                                                            if (selectedVariant.cart_count >= Number(setting.setting.max_cart_items_count)) {
                                                                                toast.error('Apologies, maximum product quantity limit reached')
                                                                            }
                                                                            else {
                                                                                addtoCart(product.id, selectedVariant.id, selectedVariant.cart_count + 1)

                                                                            }
                                                                        }
                                                                        else {

                                                                            if (selectedVariant.cart_count >= Number(selectedVariant.stock)) {
                                                                                toast.error('OOps, Limited Stock Available')
                                                                            }
                                                                            else if (selectedVariant.cart_count >= Number(setting.setting.max_cart_items_count)) {
                                                                                toast.error('Apologies, maximum cart quantity limit reached')
                                                                            }
                                                                            else {
                                                                                addtoCart(product.id, selectedVariant.id, selectedVariant.cart_count + 1)

                                                                            }
                                                                        }

                                                                    }} className="wishlist-button"><BsPlus fill='#fff' /> </button>


                                                                </div>
                                                            </> : <>
                                                                <button type='button' id={`Add-to-cart-quickview`} className='add-to-cart'
                                                                    onClick={() => {

                                                                        if (cookies.get('jwt_token') !== undefined) {

                                                                            if (cart.cart && cart.cart.data.cart?.some(element => element.product_variant_id === product.variants.find((variant) => variant.id == variant_index).id)) {
                                                                                toast.info('Product already in Cart')
                                                                            } else {
                                                                                if (product.variants[0].status) {

                                                                                    addtoCart(product.id, selectedVariant.id, 1)
                                                                                } else {
                                                                                    toast.error(t("out_of_stock_message"))
                                                                                }
                                                                            }
                                                                        }
                                                                        else {
                                                                            toast.error(t("required_login_message_for_cartRedirect"))
                                                                        }
                                                                    }}>{t("add_to_cart")}</button>
                                                            </>)
                                                                : product.variants[0].cart_count >= 1 ? <>
                                                                    <div id={`input-cart-quickview`} className="input-to-cart">
                                                                        <button type='button' onClick={() => {

                                                                            if (product.variants[0].cart_count === 1) {

                                                                                removefromCart(product.id, product.variants[0].id)
                                                                            }
                                                                            else {
                                                                                addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count - 1)
                                                                                setQuantity(quantity - 1);
                                                                            }

                                                                        }} className="wishlist-button"><BiMinus fill='#fff' /></button>
                                                                        <span id={`input-quickview`} >{product.variants[0].cart_count}</span>
                                                                        <button type='button' onClick={() => {

                                                                            if (Number(product.is_unlimited_stock)) {
                                                                                if (product.variants[0].cart_count >= Number(setting.setting.max_cart_items_count)) {
                                                                                    toast.error('Apologies, maximum product quantity limit reached')
                                                                                }

                                                                                else {
                                                                                    addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count + 1)

                                                                                }
                                                                            }
                                                                            else {

                                                                                if (product.variants[0].cart_count >= Number(setting.setting.max_cart_items_count)) {
                                                                                    toast.error('Apologies, maximum product quantity limit reached')
                                                                                }
                                                                                else if (product.variants[0].cart_count >= Number(product.variants[0].stock)) {
                                                                                    toast.error('OOps, Limited Stock Available')
                                                                                }
                                                                                else {
                                                                                    addtoCart(product.id, product.variants[0].id, product.variants[0].cart_count + 1)

                                                                                }
                                                                            }

                                                                        }} className="wishlist-button"><BsPlus fill='#fff' /> </button>


                                                                    </div>
                                                                </> : <>


                                                                    <button type='button' id={`Add-to-cart-quickview`} className='add-to-cart'
                                                                        onClick={() => {
                                                                            if (cookies.get('jwt_token') !== undefined) {

                                                                                if (cart.cart && cart.cart.data.cart?.some(element => element.product_variant_id === product.variants.find((variant) => variant.id == variant_index))) {
                                                                                    toast.info('Product already in Cart')
                                                                                } else {
                                                                                    if (product.variants[0].status) {

                                                                                        addtoCart(product.id, product.variants[0].id, 1)
                                                                                    } else {
                                                                                        toast.error(t("out_of_stock_message"))
                                                                                    }
                                                                                }
                                                                            }
                                                                            else {
                                                                                toast.error(t("required_login_message_for_cartRedirect"))
                                                                            }
                                                                        }}>{t("add_to_cart")}</button>

                                                                </>
                                                        }

                                                        {

                                                            favorite.favorite && favorite.favorite.data?.some(element => element.id === product.id) ? (
                                                                <button type="button" className='wishlist-product' onClick={() => {
                                                                    if (cookies.get('jwt_token') !== undefined) {
                                                                        removefromFavorite(product.id)
                                                                    } else {
                                                                        toast.error(t('required_login_message_for_cart'))
                                                                    }
                                                                }}
                                                                >
                                                                    <BsHeartFill size={16} fill='green' />
                                                                </button>
                                                            ) : (
                                                                <button key={product.id} type="button" className='wishlist-product' onClick={() => {
                                                                    if (cookies.get('jwt_token') !== undefined) {
                                                                        addToFavorite(product.id)
                                                                    } else {
                                                                        toast.error(t("required_login_message_for_cart"))
                                                                    }
                                                                }}>
                                                                    <BsHeart size={16} /></button>
                                                            )}

                                                        {product?.fssai_lic_no &&
                                                            <div className='fssai-details'>
                                                                <div className='image-container'>
                                                                    <img src={product?.fssai_lic_img} />
                                                                </div>
                                                                <div className='fssai-license-no'>
                                                                    <span>
                                                                        {`${t('license_no')} : ${product.fssai_lic_no}`}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        }
                                                        <div className='product-overview'>

                                                            {productbrand !== "" ? (

                                                                <div className='product-tags'>
                                                                    <span className='tag-title'>{t("brand")} :</span>
                                                                    <span className='tag-name'>{productbrand.name} </span>
                                                                </div>
                                                            ) : ""}
                                                            {/* {product.tags !== "" ? (

                                                                <div className='product-tags'>
                                                                    <span className='tag-title'>{t("product_tags")}:</span>
                                                                    <span className='tag-name'>{product.tags} </span>
                                                                </div>
                                                            ) : ""} */}


                                                        </div>
                                                        <div className='share-product-container'>
                                                            <span>{t("share_product")} :</span>

                                                            <ul className='share-product'>
                                                                <li className='share-product-icon'><WhatsappShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${product.slug}`}><WhatsappIcon size={32} round={true} /></WhatsappShareButton></li>
                                                                <li className='share-product-icon'><TelegramShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${product.slug}`}><TelegramIcon size={32} round={true} /></TelegramShareButton></li>
                                                                <li className='share-product-icon'><FacebookShareButton url={`${setting.setting && setting.setting.web_settings.website_url}product/${product.slug}`}><FacebookIcon size={32} round={true} /></FacebookShareButton></li>
                                                                <li className='share-product-icon'>
                                                                    <button type='button' onClick={() => {
                                                                        navigator.clipboard.writeText(`${setting.setting && setting.setting.web_settings.website_url}product/${product.slug}`)
                                                                        toast.success("Copied Succesfully!!")
                                                                    }}> <BiLink size={30} /></button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>

                                                    {/* <div className='key-feature'>
                                                <p>Key Features</p>
                                            </div> */}


                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QuickViewModal
