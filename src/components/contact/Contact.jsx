import React from 'react'
import { useSelector } from 'react-redux'
import coverImg from '../../utils/cover-img.jpg'
import './contact.css'
import Loader from '../loader/Loader'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const Contact = () => {

    const setting = useSelector(state => (state.setting))
    const {t} = useTranslation()
    const placeHolderImage = (e) =>{
        
        e.target.src = setting.setting?.web_logo
    }
    return (
        <section id='contact-us' className='contact-us'>
            {setting.setting === null ? <Loader screen='full' />
                : (
                    <>
                        <div className='cover'>
                            <img  onError={placeHolderImage} src={coverImg} className='img-fluid' alt="cover"></img>
                            <div className='title'>
                                <h3>{t("contact_us")}</h3>
                                <span> <Link to="/" className='text-light text-decoration-none'>{t("home")} /</Link> </span><span className='active'>{t("contact_us")}</span>
                            </div>
                        </div>
                        <div className='container'>
                            <div className='contact-wrapper'  dangerouslySetInnerHTML={{ __html: setting.setting.contact_us }}>

                                

                            </div>
                        </div>
                    </>
                )}


        </section>
    )
}

export default Contact
