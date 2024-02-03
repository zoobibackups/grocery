import React, { useEffect, useRef, useState } from 'react'
import './order.css'
import api from '../../api/api'
import Cookies from 'universal-cookie';
import { FaRupeeSign } from "react-icons/fa";
import { AiOutlineCloseCircle } from 'react-icons/ai';
import Loader from '../loader/Loader';
import Pagination from 'react-js-pagination';
import No_Orders from '../../utils/zero-state-screens/No_Orders.svg'
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { ProgressBar, Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import OrderTracker from './OrderTracker';


const Order = () => {


    const [NoOrders, setNoOrders] = useState(false);
    const [totalActiveOrders, setTotalActiveOrders] = useState(null)
    const [totalPrevOrders, setTotalPrevOrders] = useState(null)
    const [ActiveOrders, setActiveOrders] = useState([])
    const [PrevOrders, setPrevOrders] = useState([])
    const [offset, setoffset] = useState(0)
    const [currPage, setcurrPage] = useState(1)
    const [isLoader, setisLoader] = useState(false)
    const [showTracker, setShowTracker] = useState(false)

    //initialize Cookies
    const cookies = new Cookies();
    const componentRef = useRef();
    const total_orders_per_page = 10;

    const navigate = useNavigate()

    const setting = useSelector(state => state.setting)
    const [orderId, setOrderId] = useState(null)

    const fetchOrders = async () => {
        await api.getOrders(cookies.get('jwt_token'), total_orders_per_page, offset)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    setisLoader(false)
                    setActiveOrders(result.data);
                    setTotalActiveOrders(result.total)
                }
                else if (result.message === "No orders found") {
                    setisLoader(false)
                    setNoOrders(true)
                }
            })

        await api.getOrders(cookies.get('jwt_token'), total_orders_per_page, offset, 0)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    setisLoader(false)
                    setPrevOrders(result.data);
                    setTotalPrevOrders(result.total)
                }
                else if (result.message === "No orders found") {
                    setisLoader(false)
                    setNoOrders(true)
                }
            })
    }

    useEffect(() => {
        setisLoader(true)
        fetchOrders()
    }, [offset])

    //page change
    const handlePageChange = (pageNum) => {
        setcurrPage(pageNum);
        setoffset(pageNum * total_orders_per_page - total_orders_per_page)
    }


    const getInvoice = async (Oid) => {
        setisLoader(true)
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
            setisLoader(false)


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

    const closeModalRef = useRef();
    const getOrderStatus = (pid) => {
        for (let i = 0; i < ActiveOrders.length; i++) {
            const element = ActiveOrders[i];
            // if (element.id === pid) {
            //     let html = `

            //                         `;
            //     document.getElementById('mainContentTrack').innerHTML = html;

            // }
            closeModalRef.current.click()
        }
    }
    const [element, setElement] = useState({});
    const setHtml = (ID, status = 0) => {

        if (!status) {
            
            ActiveOrders.map((obj, index) => {
                if (obj.id === Number(ID)) {
                    setElement(obj)
                    
                }
            })
        }else {
            PrevOrders?.map((obj, index) => {
                if (obj.id === Number(ID)) {
                    setElement(obj)
                    
                }
            })
        }
    }
    const handlePrint = () => {
        if (closeModalRef.current) {
            closeModalRef.current.click();
            toast.success('Invoice Downloaded Successfully')
        }
    };
    const { t } = useTranslation();
    return (
        <div className='order-list'>
            <div className='heading'>
                {t("all_orders")}
            </div>

            {isLoader ?
                <div className='my-5'><Loader width='100%' height='350px' /></div>
                : <>

                    <Tabs
                        defaultActiveKey={"active"}
                        className='orders-tab'
                        fill
                    >
                        <Tab
                            eventKey={'active'}
                            title={t('active_orders')}
                            className='active-orders'
                        >
                            <>
                                {ActiveOrders && ActiveOrders.length === 0
                                    ? <div className='d-flex align-items-center p-4 no-orders'>
                                        <img src={No_Orders} className='no-data-img' alt='no-orders'></img>
                                        <p>{t("no_order")}</p>
                                    </div>
                                    :
                                    <>
                                        <table className='order-list-table'>
                                            <thead>
                                                <tr>
                                                    <th>{t("order")}</th>
                                                    <th>{t("products") + " " + t("name")}</th>
                                                    <th>{t("date")}</th>
                                                    <th>{t("total")}</th>
                                                    <th>{t("action")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ActiveOrders && ActiveOrders.map((order, index) => (
                                                    <tr key={index} className={index === ActiveOrders.length - 1 ? 'last-column' : ''}>
                                                        <th>{`#${order.order_id} `}</th>
                                                        <th className='product-name d-table-cell verticall-center flex-column justify-content-center'>{order.items.map((item, ind) => (
                                                            <div className="column-container" key={ind}>
                                                                <span>{item.product_name}</span>
                                                                {ind < order.items.length - 1 && <span>,</span>}
                                                            </div>
                                                        ))}
                                                        </th>
                                                        <th>
                                                            {order.created_at.substring(0, 10)}
                                                        </th>
                                                        <th className='total'>
                                                            <FaRupeeSign fontSize={'1.7rem'} /> {order.final_total}
                                                        </th>
                                                        <th className='button-container'>
                                                            <button type='button' id={`track - ${order.order_id} `} data-bs-toggle="modal" data-bs-target="#trackModal" className='track' value={order.order_id} onClick={(e) => { setHtml(e.target.value); getOrderStatus(e.target.value) }}>{t("track_order")}</button>
                                                            {/* <button type='button' id={`invoice - ${order.order_id} `} className='Invoice' value={order.order_id} onClick={(e) => { setHtml(e.target.value); getInvoice(e.target.value) }}>{t("get_invoice")}</button> */}
                                                            <button onClick={() => {
                                                                navigate(`${order.order_id}`)
                                                            }} className='Invoice'>{t('view_details')}</button>
                                                        </th>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                }
                                {ActiveOrders && ActiveOrders.length !== 0 ?
                                    <Pagination
                                        activePage={currPage}
                                        itemsCountPerPage={total_orders_per_page}
                                        totalItemsCount={totalActiveOrders}
                                        pageRangeDisplayed={5}
                                        onChange={handlePageChange.bind(this)}
                                    />
                                    : null}
                            </>
                        </Tab>
                        <Tab
                            eventKey={'prev'}
                            title={t('previous_orders')}
                            className='prev-orders'
                        >
                            <>
                                {PrevOrders && PrevOrders.length === 0
                                    ? <div className='d-flex align-items-center p-4 no-orders'>
                                        <img src={No_Orders} alt='no-orders'></img>
                                        <p>{t("no_order")}</p>
                                    </div>
                                    :
                                    <>
                                        <table className='order-list-table'>
                                            <thead>
                                                <tr>
                                                    <th>{t("order")}</th>
                                                    <th>{t("products") + " " + t("name")}</th>
                                                    <th>{t("date")}</th>
                                                    <th>{t("total")}</th>
                                                    <th>{t("action")}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {PrevOrders && PrevOrders.map((order, index) => (
                                                    <tr key={index} className={index === PrevOrders.length - 1 ? 'last-column' : ''}>
                                                        <th>{`#${order.order_id} `}</th>
                                                        <th className='product-name d-table-cell verticall-center flex-column justify-content-center'>{order.items.map((item, ind) => (
                                                            <div className="column-container">
                                                                <span key={ind}>{item.product_name},</span>
                                                            </div>
                                                        ))}
                                                        </th>
                                                        <th>
                                                            {order.created_at.substring(0, 10)}
                                                        </th>
                                                        <th className='total'>
                                                            <FaRupeeSign fontSize={'1.7rem'} /> {order.final_total}
                                                        </th>
                                                        <th className='button-container'>
                                                            <button type='button' id={`track - ${order.order_id} `} data-bs-toggle="modal" data-bs-target="#trackModal" className='track' value={order.order_id} onClick={(e) => { setHtml(e.target.value, 1); getOrderStatus(e.target.value) }}>{t("track_order")}</button>
                                                            {/* <button type='button' id={`invoice - ${order.order_id} `} className='Invoice' value={order.order_id} onClick={(e) => { setHtml(e.target.value); getInvoice(e.target.value) }}>{t("get_invoice")}</button> */}
                                                            <button onClick={() => {
                                                                navigate(`${order.order_id}`)
                                                            }} className='Invoice'>{t('view_details')}</button>
                                                        </th>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                }
                                {PrevOrders && PrevOrders.length !== 0 ?
                                    <Pagination
                                        activePage={currPage}
                                        itemsCountPerPage={total_orders_per_page}
                                        totalItemsCount={totalPrevOrders}
                                        pageRangeDisplayed={5}
                                        onChange={handlePageChange.bind(this)}
                                    />
                                    : null}
                            </>
                        </Tab>
                    </Tabs>
                </>
            }






            <div id="track">
                <div className="modal fade new-track" id="trackModal" aria-labelledby="TrackModalLabel" aria-hidden="true">
                    <div className='modal-dialog'>
                        <div className="modal-content" style={{ borderRadius: "10px", maxWidth: "100%", padding: "30px 15px", zIndex: -2 }}>
                            <div id="mainContentTrack">

                                <section className="track" id="printMe">
                                    <div className="d-flex justify-content-between align-items-center mx-5">
                                        <h5 className="page-header">{setting.setting?.app_name}</h5>
                                        <h5 className="page-header">{t("mobile")}{element && element.mobile}</h5>
                                        <button type="button" className="bg-white" data-bs-dismiss="modal" aria-label="Close" ref={closeModalRef} style={{ width: '30px' }}><AiOutlineCloseCircle size={26} /></button>
                                    </div>
                                    <div className="d-flex flex-column">
                                        <div className="d-flex flex-column mx-5 justify-content-around position-relative">
                                            <div className="d-flex my-4 align-items-center">
                                                <div className="col-sm-4 bg-white track-col"> <span className="rounded-circle px-3 pt-2 fs-2 track-order-icon btn " style={{ background: "var(--secondary-color-light)" }}><i className="bi bi-cart "></i></span></div>
                                                <span className=""> {t("order_status_display_name_recieved")}</span>
                                                <ProgressBar now={element && element.active_status === "2" ? 23 : element.active_status === "5" ? 77 : element.active_status === "4" ? 57 : element.active_status === "6" ? 100 : 0} />
                                            </div>
                                            {/* <div className="progress flex-column col-sm-3" role="progressbar" aria-label="Basic example" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">

                                                <div
                                                    className="progress-bar bg-success"
                                                    style={{
                                                        height: element && element.active_status === "2" ? "23%" : element.active_status === "5" ? "77%" : element.active_status === "4" ? "57%" : element.active_status === "6" ? "100%" : "0%"
                                                    }}></div>
                                                </div> */}
                                            <div className="d-flex my-4 align-items-center">
                                                <div className="col-sm-4 bg-white track-col"> <span className="rounded-circle px-3 pt-2 fs-2 track-order-icon btn " style={{ background: "var(--secondary-color-light)" }}><i className="bi bi-truck "></i></span></div>
                                                <span> {t("order_status_display_name_shipped")}</span>
                                            </div>
                                            <div className="d-flex my-4 align-items-center">
                                                <div className="col-sm-4 bg-white track-col"> <span className="rounded-circle px-3 pt-2 fs-2 btn track-order-icon " style={{ background: "var(--secondary-color-light)" }}><i className="bi bi-bus-front "></i></span></div>
                                                <span> {t("order_status_display_name_out_for_delivery")}</span>
                                            </div>
                                            <div className="d-flex my-4 align-items-center">
                                                <div className="col-sm-4 bg-white track-col"> <span className="rounded-circle px-3 pt-2 fs-2 btn track-order-icon " style={{ background: "var(--secondary-color-light)" }}><i className="bi bi-check "></i></span></div>
                                                <span> {t("order_status_display_name_delivered")}</span>
                                            </div>
                                        </div>
                                    </div>



                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <OrderTracker show={showTracker} setShow={setShowTracker} />
        </div>
    )
}

export default Order
