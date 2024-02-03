import React, { useRef, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import HomeContainer from './homecontainer/HomeContainer'
import Loader from './loader/Loader'
import ProductContainer from './product/ProductContainer'
import { AiOutlineClose } from 'react-icons/ai'
import { Modal } from 'react-bootstrap'

const MainContainer = () => {

    const dispatch = useDispatch()

    const modalRef = useRef()

    const setting = useSelector(state => state.setting)


    useEffect(() => {

        if (modalRef.current && setting.setting !== null) {
            modalRef.current.click()
        }
    }, [setting])

    const [showPop, setShowPop] = useState(true);

    const placeHolderImage = (e) => {
        e.target.src = setting.setting?.web_logo
    }
    return (
        <>

            {setting.setting === null
                ? <Loader screen='full' />
                : (
                    <>
                        <div className='home-page content' style={{ paddingBottom: "5px", minHeight: "75vh" }}>
                            <HomeContainer />
                            <ProductContainer />
                        </div>

                        {parseInt(setting.setting.popup_enabled) === 1 ?
                            (
                                <>
                                    <Modal className='popup'
                                        centered
                                        show={showPop}
                                        onBackdropClick={() => setShowPop(false)}
                                        backdrop={"static"}
                                    >
                                        <Modal.Header onClick={() => { setShowPop(false) }}>
                                            <AiOutlineClose size={32} fill='#fff' />
                                        </Modal.Header>
                                        <Modal.Body>
                                            <img src={setting.setting.popup_image} alt='image' onClick={() => {
                                                if (setting.setting?.popup_type === "popup_url") {
                                                    window.location = setting.setting.popup_url
                                                }
                                                else if (setting.setting?.popup_type === "category") {

                                                }

                                            }} style={{ width: "100%", height: "100%" }} onError={placeHolderImage}></img>
                                        </Modal.Body>
                                    </Modal>

                                </>
                            ) : null}
                    </>)}
        </>

    )
}

export default MainContainer
