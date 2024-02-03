import '../category/category.css'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import { ActionTypes } from '../../model/action-type'
import coverImg from '../../utils/cover-img.jpg'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

const BrandList = () => {
    const setting = useSelector(state => state.setting)
    const filter = useSelector(state => state.productFilter);

    const [brands, setBrands] = useState(null)

    const dispatch = useDispatch()
    const navigate = useNavigate()
    useEffect(() => {
        api.getBrands().then(response => response.json()).then((response) => {
            if (response.status) {
                setBrands(response.data)
            }else {
                toast.error(response.message)
            }
        })


    }, [])
    const placeHolderImage = (e) => {
        
        e.target.src = setting.setting?.web_logo
    }
    const sort_unique_brand_ids = (int_brand_ids) => {
        if (int_brand_ids.length === 0) return int_brand_ids;
        int_brand_ids = int_brand_ids.sort(function (a, b) { return a * 1 - b * 1; });
        var ret = [int_brand_ids[0]];
        for (var i = 1; i < int_brand_ids.length; i++) { //Start loop at 1: arr[0] can never be a duplicate
            if (int_brand_ids[i - 1] !== int_brand_ids[i]) {
                ret.push(int_brand_ids[i]);
            }
        }
        return ret;
    }
    const { t } = useTranslation()
    return (
        <section id='allcategories'  >
            <div className='cover'>
                <img src={coverImg} onError={placeHolderImage} className='img-fluid' alt="cover"></img>
                <div className='page-heading'>
                    <h5>{t("brands")}</h5>
                    <p><Link to="/" className='text-light text-decoration-none'>{t("home")} /</Link> <span>{t("brands")}</span></p>
                </div>
            </div>

            <div className='container' style={{ padding: "30px 0" }}>
                {!brands
                    ? (
                        <div className="d-flex justify-content-center">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )
                    : (
                        <div className='row justify-content-center'>
                            {brands?.map((ctg, index) => (
                                <div className="col-md-4 col-lg-3 col-6  my-3 content" key={index} onClick={() => {

                                    // setSelectedBrands((prev) => [...prev, ...brand.id])
                                    var brand_ids = [...filter.brand_ids];

                                    if (brand_ids.includes(ctg.id)) {
                                        brand_ids.splice(ctg.indexOf(ctg.id), 1)
                                    }
                                    else {
                                        brand_ids.push(parseInt(ctg.id));
                                    }

                                    const sorted_brand_ids = sort_unique_brand_ids(brand_ids);

                                    dispatch({ type: ActionTypes.SET_FILTER_BRANDS, payload: sorted_brand_ids })
                                    navigate('/products')
                                }}>

                                    <div className='card'>
                                        <img onError={placeHolderImage} className='card-img-top' src={ctg.image_url} alt='' />
                                        <div className='card-body' style={{ cursor: "pointer" }} >
                                            <p>{ctg.name} </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
            </div>
        </section>
    )

}

export default BrandList
