import React from 'react'
import Category from '../category/Category'
import Slider from '../sliders/Slider'
import './homecontainer.css'
import { useSelector } from 'react-redux'
import Brand from '../brands/Brand'

const HomeContainer = () => {
    const shop = useSelector((state) => state.shop)
    return (

        // elementor-section-height-min-height elementor-section-items-stretch elementor-section-boxed elementor-section-height-default
        <section id="home" className='home-section container home-element section'>
            {/* Slider & Category */}


            <div className='home-container row'>
                <div className="col-md-12 p-0 col-12">
                    <Slider />
                </div>
            </div>


            {shop.shop?.is_category_section_in_homepage ?
                <div className='category_section'>
                    <div className="container">

                        <Category />

                    </div>
                </div>
            :<></>}
            {shop.shop?.is_brand_section_in_homepage ?
                <div className='category_section'>
                    <div className="container">

                        <Brand />

                    </div>
                </div>
            :<></>}



        </section>

    )
}

export default HomeContainer
