import React, { useEffect, useState } from 'react'
import coverImg from '../../utils/cover-img.jpg'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import './order.css'
import api from '../../api/api'
import Cookies from 'universal-cookie'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from 'axios'

const OrderDetails = () => {
    const { t } = useTranslation()

    const setting = useSelector(state => state.setting)

    const [orderData, setOrderData] = useState(null);
    const [orderStatus, setOrderStatus] = useState(t("recieved"));

    const urlParams = useParams()

    useEffect(() => {
        if (orderData?.active_status === "6") {
            setOrderStatus(t("delivered"))
        } else if (orderData?.active_status === "5") {
            setOrderStatus(t("out_for_delivery"))
        } else if (orderData?.active_status === "4") {
            setOrderStatus(t("shipped"))
        } else if (orderData?.active_status === "3") {
            setOrderStatus(t("processed"))
        }
        else if (orderData?.active_status === "7") {
            setOrderStatus(t("cancelled"))
        }
        else if (orderData?.active_status === "8") {
            setOrderStatus(t("returned"))
        }
    }, [orderData])

    const cookies = new Cookies()

    const placeHolderImage = (e) => {

        e.target.src = setting.setting?.web_logo
    }

    const fetchOrderDetails = async () => {
        api.getOrders(cookies.get('jwt_token'), null, null, null, urlParams?.id).then(result => result.json()).then((response) => {

            if (response.status) {
                setOrderData(response.data[0])
            } else {
                toast.error(response.message)
            }
        })

    }

    useEffect(() => {
        fetchOrderDetails()
    }, [])


    const getInvoice = async (Oid) => {
        let postData = new FormData()
        postData.append('order_id', Oid)
        axios({
            url: `${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_SUBURL}/invoice_download`,
            method: 'post',
            responseType: 'blob',
            /*responseType: 'application/pdf',*/
            data: postData,
            headers: {
                Authorization: `Bearer ${cookies.get('jwt_token')}`
            }
        }).then(response => {


            var fileURL = window.URL.createObjectURL(new Blob([response.data]));
            var fileLink = document.createElement('a');
            fileLink.href = fileURL;
            fileLink.setAttribute('download', 'Invoice-No:' + Oid + '.pdf');
            document.body.appendChild(fileLink);
            fileLink.click();


        }).catch(error => {
            if (error.request.statusText) {
                toast.error(error.request.statusText);
            } else if (error.message) {
                toast.error(error.message);
            } else {
                toast.error("Something went wrong!");
            }
        });
    }
    const navigate = useNavigate()

    const handleUpdateStatus = async (item_id, status) => {
        await api.updateOrderStatus(cookies.get('jwt_token'), orderData?.id, item_id, status)
            .then((result) => result.json())
            .then((response) => {
                if (response.status) {
                    response.data && setOrderData(response.data)
                    toast.success(response.message)
                }

            }).catch((error) => {
                console.error(error)
            })
    }


    return (
        <>
            <section className="order-details-page">
                <div className='cover'>
                    <img src={coverImg} onError={placeHolderImage} className='img-fluid' alt="cover"></img>
                    <div className='page-heading'>
                        <h3>{t("order_details")}</h3>
                        <p><strong onClick={() => navigate('/')}>{t("home")}</strong> / <span> <span onClick={() => navigate('/profile/orders')}>{t("order")}</span> / {orderData?.id}</span></p>
                    </div>
                </div>

                <div className="container">
                    <div className="row">
                        <div className="col-12 col-xl-9">
                            <div className="order-container">
                                <div className="list-container">

                                    <div className="container-heading">
                                        <span>
                                            {t('items')}
                                        </span>
                                    </div>
                                    <div className="container-body">
                                        <div className="table-container">
                                            <table className="table">

                                                <thead>
                                                    <th>{t('product')}</th>
                                                    <th>{t('price')}</th>
                                                    {/* <th>{t('action')}</th> */}
                                                </thead>
                                                <tbody>
                                                    {orderData?.items?.map((item, index) => {
                                                        return (
                                                            <>
                                                                <tr key={index} className={Number(item?.active_status) > 6 ? 'disabled' : ''}>
                                                                    <td>
                                                                        <div className="product">

                                                                            <div className="image-container">
                                                                                <img src={item.image_url} alt="" />
                                                                            </div>
                                                                            <div className="item-container">
                                                                                <span className='item-name'>{item.name}</span>
                                                                                <span className='item-quantity'> X {item.quantity}</span>
                                                                                <span className='item-variant'>{` ${item.measurement} ${item.unit}`}</span>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="price-container">
                                                                            <span className="discounted-price">
                                                                                {`${setting.setting?.currency} ${item.price}`}
                                                                            </span>
                                                                            {/* {item.discounted_price !== 0 ?
                                                                                <span className="original-price">
                                                                                    {`${setting.setting?.currency} ${item.price}`}
                                                                                </span>
                                                                                : ""} */}
                                                                        </div>
                                                                        <div className="actions-container">

                                                                            {!Number(item?.active_status) > 6 && !item?.cancelable_status && item?.return_status ?
                                                                                <span className="return">
                                                                                    <button onClick={() => handleUpdateStatus(item?.id, 8)}>{t('return')}</button>
                                                                                </span>
                                                                                : <></>
                                                                            }

                                                                            {!Number(item?.active_status) > 6 && item?.cancelable_status ?
                                                                                <span className="cancel">
                                                                                    <button onClick={() => handleUpdateStatus(item?.id, 7)}>{t('cancel')}</button>
                                                                                </span>
                                                                                : <></>
                                                                            }

                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            </>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-xl-3">
                            <div className="order-info">
                                <div className="order-status-container order-info-container">
                                    <div className="container-heading">
                                        <span>
                                            {t('order')}
                                        </span>
                                        <span className="order-id">
                                            #{orderData?.id}

                                        </span>
                                    </div>
                                    <div className="status-body">
                                        <div className="checkmark">
                                            <input type="checkbox" defaultChecked />
                                        </div>
                                        <div className="order-status-details">
                                            <div className="order-status">
                                                {`${t('order')} ${orderStatus}`}
                                            </div>
                                            <div className="order-success">
                                                {`${t('your_order_has_been')} ${orderStatus} ${t('successfully')}`}
                                            </div>
                                            <div className="status-date">
                                                {orderData?.status?.length > 0 && new Date(orderData?.status.reverse()[0].reverse()[0]).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="payment-status">
                                            {/* <span className={`${orderData?.bank_transfer_status ? 'done' : ''}`}>
                                                {orderData?.bank_transfer_status ? t('payment_pending') : t('payment_done')}
                                            </span> */}
                                        </div>
                                    </div>
                                </div>
                                <div className="order-info-container order-delivery-info">
                                    <div className="container-heading">
                                        <span>
                                            {t('delivery_information')}
                                        </span>
                                    </div>
                                    <div className="container-body">
                                        <div className="address-container">
                                            <span className='address-heading'>
                                                {t('delivery_to')}
                                            </span>
                                            <span className='address-info'>
                                                {orderData?.order_address}
                                            </span>
                                        </div>

                                        <div className="contact-container">
                                            <span>
                                                {`${orderData?.country} - ${orderData?.mobile}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="order-info-container order-billing-container">
                                    <div className="container-heading">
                                        <span>
                                            {t('billing_details')}
                                        </span>
                                    </div>
                                    <div className="container-body">
                                        <div className="payment-info">
                                            <div>
                                                <span>
                                                    {t('payment_method')}
                                                </span>
                                                <span>
                                                    {orderData?.payment_method}
                                                </span>
                                            </div>
                                            <div>
                                                <span>
                                                    {t('transaction_id')}
                                                </span>
                                                <span>
                                                    {orderData?.transaction_id}
                                                </span>
                                            </div>
                                            <div>
                                                <span>
                                                    {t('delivery_charge')}
                                                </span>
                                                <span>
                                                    {setting.setting?.currency}{orderData?.delivery_charge}
                                                </span>
                                            </div>
                                            <div>
                                                <span>
                                                    {t('sub_total')}
                                                </span>
                                                <span>
                                                {setting.setting?.currency}{orderData?.total}
                                                </span>
                                            </div>
                                            {orderData?.discount ?
                                                <div>
                                                    <span>
                                                        {t('discount')}
                                                    </span>
                                                    <span>
                                                    {setting.setting?.currency}{orderData?.discount}
                                                    </span>
                                                </div>
                                                : <></>}
                                        </div>
                                        <div className="order-total">

                                            <div>
                                                <span>
                                                    {t('total')}
                                                </span>
                                                <span>
                                                    ${orderData?.final_total}
                                                </span>
                                            </div>
                                        </div>
                                        {orderData?.active_status === "6" ?
                                            <div className="button-container">
                                                <button className="btn" onClick={() => {
                                                    getInvoice(orderData?.id)
                                                }}>
                                                    {t('get_invoice')}
                                                </button>
                                            </div>
                                            : <></>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default OrderDetails
