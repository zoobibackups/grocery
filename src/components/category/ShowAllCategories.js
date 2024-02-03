import './category.css'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../api/api'
import { ActionTypes } from '../../model/action-type'
import coverImg from '../../utils/cover-img.jpg'
import { useTranslation } from 'react-i18next'
import { BiArrowBack } from 'react-icons/bi'
const ShowAllCategories = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const setting = useSelector(state => (state.setting))
  const category = useSelector(state => (state.category));
  const city = useSelector(state => (state.city))

  const [isLoader, setisLoader] = useState(false)
  const [showbackButton, setShowbackButton] = useState(false)

  const getProductfromApi = async (ctg) => {
    await api.getProductbyFilter(city.city.id, city.city.latitude, city.city.longitude, { category_id: ctg.id })
      .then(response => response.json())
      .then(result => {
        if (result.status === 1) {
          setMap(new Map(map.set(`category${ctg.id}`, result.total)))
        }
      })
  }

  //fetch Category
  const fetchCategory = (id = 0) => {
    setisLoader(true)
    api.getCategory(id)
      .then(response => response.json())
      .then(result => {
        if (result.status === 1) {
          dispatch({ type: ActionTypes.SET_CATEGORY, payload: result.data });
        }
        setisLoader(false)
      })
      .catch(error => {
        setisLoader(false)
        console.log("error ", error)
      }
      )
  }

  useEffect(() => {
    if (category.status === 'loading' && category.category === null) {
      fetchCategory();
    }
    else if (category.status !== 'loading' || city.city !== null) {
      category.category.forEach(ctg => {
        getProductfromApi(ctg)
      });
    }
  }, [category])


  //categories and their product count map
  const [map, setMap] = useState(new Map())


  const selectCategory = (category) => {
    if (category.has_child) {
      fetchCategory(category.id)
      setShowbackButton(true)
    } else {

      dispatch({ type: ActionTypes.SET_FILTER_CATEGORY, payload: category.id })
      navigate('/products')
    }
  }

  const { t } = useTranslation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }, [category])

  const placeHolderImage = (e) => {
    e.target.src = setting.setting?.web_logo
  }
  return (
    <section id='allcategories'  >
      <div className='cover'>
        <img src={coverImg} onError={placeHolderImage} className='img-fluid' alt="cover"></img>
        <div className='page-heading'>
          <h5>{t("categories")}</h5>
          <p><Link to="/" className='text-light text-decoration-none'>{t("home")} /</Link> <span>{t("categories")}</span></p>
        </div>
      </div>

      <div className='container' style={{ padding: "30px 0" }}>
        {showbackButton ?
          <div className='back-button' onClick={() => {
            fetchCategory()
            setShowbackButton(false)
            }}>
            <BiArrowBack size={32} fill='var(--secondary-color)' />
          </div>
          : <></>}

        {category.status === 'loading'
          ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )
          : (
            <div className='row justify-content-center'>
              {category.category.map((ctg, index) => (
                <div className="col-md-4 col-lg-3 col-6  my-3 content" key={index} onClick={() => selectCategory(ctg)}>

                  <div className='card'>
                    <img onError={placeHolderImage} className='card-img-top' src={ctg.image_url} alt='' />
                    <div className='card-body' style={{ cursor: "pointer" }}>
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

export default ShowAllCategories
