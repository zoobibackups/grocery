import React from 'react'
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom';
import '../category/category.css'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { AiOutlineArrowRight } from 'react-icons/ai';
import Slider from 'react-slick';
import { ActionTypes } from '../../model/action-type';

const Brand = () => {
  const shop = useSelector(state => state.shop)

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const setting = useSelector(state => (state.setting))
  const { t } = useTranslation();

  const sliderRef = useRef(null);

  const handlePrevClick = () => {
    sliderRef.current.slickPrev();
  };

  const handleNextClick = () => {
    sliderRef.current.slickNext();
  };
  const settings = {
    infinite: false,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: false,
    direction: 'rtl',
    pauseOnDotsHover: false,
    pauseOnFocus: true,
    slidesToShow: 5,
    slidesPerRow: 1,
    initialSlide: 0,

    // Add custom navigation buttons using Font Awesome icons
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 4
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
        }
      },

      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
        }
      },
      {
        breakpoint: 425,
        settings: {
          slidesToShow: 2,

        }
      }
    ]
  };
  const placeHolderImage = (e) => {
    
    e.target.src = setting.setting?.web_logo
  }
  return (
    <>
      {/* {
      shop.shop?.brand && */}
      <section className="all-brands">
        <div className="row category_section_header">
          <div className="col-md-12 col-12 d-flex justify-content-between align-items-center p-0">
            <div className="title d-md-flex align-items-center ">
              <p>{t('shop_by')} {t('brands')}</p>
              <Link className='d-none d-md-block' to='/brands'>{t('see_all')} {t('brands')}<AiOutlineArrowRight size={15} className='see_category_arrow' /> </Link>
            </div>
            <div className=' d-md-none'>
              <Link className='category_button' to='/brands'>{t('see_all')}</Link>
            </div>
            <div className=" justify-content-end align-items-ceneter d-md-flex d-none">
              <button className='prev-arrow-category' onClick={handlePrevClick}><FaChevronLeft size={20} /></button>
              <button className='next-arrow-category' onClick={handleNextClick}><FaChevronRight size={20} /></button>
            </div>
          </div>
        </div>
        <div className='row justify-content-center home' id='allcategories'>
          <Slider {...settings} ref={sliderRef}>
            {shop.shop?.brands?.map((ctg, index) => (
              <div className="my-3 content" key={index} onClick={() => {
                dispatch({ type: ActionTypes.SET_FILTER_BRANDS, payload: ctg.id.toString() })
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
          </Slider>


        </div>
      </section>
      {/* } */}
    </>
  )
}

export default Brand
