import React,{ useEffect,useRef,useState } from 'react'
import { AiOutlineCloseCircle } from 'react-icons/ai'
import 'react-phone-input-2/lib/style.css'
import { useDispatch,useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import api from '../../api/api'
import { ActionTypes } from '../../model/action-type'
import Loader from '../loader/Loader'
import './login.css'

//phone number input

//otp
import OTPInput from 'otp-input-react'

//firebase
import { signInWithPhoneNumber } from "firebase/auth"


import { jwtDecode } from 'jwt-decode'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import Cookies from 'universal-cookie'
import { setlocalstorageOTP } from '../../utils/manageLocalStorage'

import PhoneInput from 'react-phone-input-2'
import FirebaseData from '../../utils/firebase/FirebaseData'

const Login = (props) => {
    const { auth, firebase, messaging } = FirebaseData();
    const setting = useSelector(state => (state.setting))

    const [fcm, setFcm] = useState('')

    // useEffect(() => {
        
    //     setting.setting?.firebase && messaging && messaging.getToken().then((res) => {
    //         setFcm(res)
    //     })
    // }, [messaging, setting])

    //initialize Cookies
    const cookies = new Cookies();
    const Navigate = useNavigate();
    const closeModalRef = useRef();

    const dispatch = useDispatch();


    const [phonenum, setPhonenum] = useState("")
    
    const [countryCode, setCountryCode] = useState("")
    const [checkboxSelected, setcheckboxSelected] = useState(false)
    const [error, setError] = useState("", setTimeout(() => {
        if (error !== "")
            setError("")
    }, 5000))
    const [isOTP, setIsOTP] = useState(false);
    const [Uid, setUid] = useState("");
    const [OTP, setOTP] = useState("");
    const [isLoading, setisLoading] = useState(false)
    const [timer, setTimer] = useState(null); // Initial timer value in seconds
    const [disabled, setDisabled] = useState(true);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0) {
            setDisabled(false); // Enable the button once the timer reaches 0
        }

        return () => clearInterval(interval); // Cleanup the interval on unmount or timer reset

    }, [timer]);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };


    useEffect(() => {
        if (firebase && auth && window.recaptchaVerifier && setting.setting.firebase) {
            window.recaptchaVerifier.clear();

        }
        firebase && auth && (window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
            size: "invisible",
            // other options
        }))
        return () => {
            if (window.recaptchaVerifier && setting.setting.firebase) {
                window.recaptchaVerifier.clear();
            }
        };
    }, [firebase, auth]);


    const handleLogin = (e) => {
        setDisabled(true)
        setisLoading(true)
        e.preventDefault();
        if (!checkboxSelected) {
            setError("Accept Terms and Policies!");
            setisLoading(false)
        }
        else {
            if (phonenum?.length < countryCode.length || phonenum.slice(1) === countryCode) {
                setError("Please enter phone number!")
                setisLoading(false)
            }
            else {
                // setOTP("");

                //OTP Generation
                // generateRecaptcha();
                let appVerifier = window.recaptchaVerifier;
                try {
                    signInWithPhoneNumber(auth, phonenum, appVerifier)
                        .then(confirmationResult => {
                            window.confirmationResult = confirmationResult;
                            setTimer(90)
                            setIsOTP(true);
                            setisLoading(false)
                        }).catch((err) => {
                            setPhonenum()
                            console.log(err.message)
                            setError(err.message)
                            setisLoading(false)
                        })
                } catch (error) {
                    setisLoading(false)
                    toast.error(error)
                }

            }
            // else {
            //     setPhonenum()
            //     setError("Enter a valid phone number")
            // }
        }
    }


    const getCurrentUser = (token) => {
        api.getUser(token)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    dispatch({ type: ActionTypes.SET_CURRENT_USER, payload: result.user });
                    toast.success("You're successfully Logged In")
                }
            })
    }

    //otp verification
    const verifyOTP = async (e) => {
        e.preventDefault();
        setisLoading(true);

        let confirmationResult = window.confirmationResult;


        await confirmationResult.confirm(OTP).then((result) => {
            // User verified successfully.
            setUid(result.user.uid)

            //login call
            const num = phonenum.replace(`+${countryCode}`, "")
            loginApiCall(num, result.user.uid, countryCode)



        }).catch(() => {
            setisLoading(false)
            // User couldn't sign in (bad verification code?)
            setOTP("")
            setError("Invalid Code")

        });


        // const countrycode = parsePhoneNumber(phonenum).countryCallingCode;
        // const num = parsePhoneNumber(phonenum).nationalNumber;


        // //login call
        // loginApiCall(phonenum, OTP, countryCode)
    }
    const loginApiCall = async (num, Uid, countrycode) => {
        await api.login(num, Uid, countrycode, fcm)
            .then(response => response.json())
            .then(result => {
                if (result.status === 1) {
                    const decoded = jwtDecode(result.data.access_token)

                    const tomorrow = new Date()
                    tomorrow.setDate(new Date().getDate() + 1)
                    cookies.set("jwt_token", result.data.access_token, {
                        expires: new Date(tomorrow)
                    })

                    getCurrentUser(result.data.access_token);
                    setlocalstorageOTP(Uid)
                    closeModalRef.current.click()
                }
                else {
                    setError(result.message);
                    setOTP("")

                }

                setisLoading(false);
            })
            .catch(error => console.log("error ", error))

    }

    const handleTerms = () => {
        if (closeModalRef.current) {
            Navigate('/terms')
            closeModalRef.current.click()
        }
    }
    const handlePolicy = () => {
        if (closeModalRef.current) {
            Navigate('/policy/Privacy_Policy')
            closeModalRef.current.click()
        }
    }

    const handleOnChange = (value, data, event, formattedValue) => {
        console.log(value,' formattedValue')
        if (value?.length > 0) {
            setPhonenum(`+${value}`)
        }else {
            setPhonenum("")
        }
        setCountryCode(data?.dialCode)
    }
    const { t } = useTranslation();

    return (
        <>
            <div className="modal fade login" id={props.modal_id} data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="loginLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content" style={{ borderRadius: "10px" }}>
                        <div className="d-flex flex-row justify-content-between align-items-center header">
                            <h5>{t("Login")}</h5>
                            <button type="button" className="" data-bs-dismiss="modal" aria-label="Close" ref={closeModalRef} onClick={() => {
                                setError("")
                                setOTP("")
                                setPhonenum("")
                                setcheckboxSelected(false)
                                setisLoading(false);
                                setIsOTP(false)

                            }}><AiOutlineCloseCircle /></button>
                        </div>
                        <div className="modal-body d-flex flex-column gap-3 align-items-center body">
                            <img src={setting.setting && setting.setting.web_settings.web_logo} alt='logo'></img>

                            {isOTP
                                ? (
                                    <>
                                        <h5>{t("enter_verification_code")}</h5>
                                        <span>{t("otp_send_message")} <p>{phonenum}</p></span>
                                    </>
                                )
                                : (
                                    <>
                                        <h5>{t("Welcome")}</h5>
                                        <span>{t("login_enter_number")}</span>
                                    </>
                                )}

                            {error === ''
                                ? ""
                                : <span className='error-msg'>{error}</span>}

                            {isOTP
                                ? (
                                    <form className='d-flex flex-column gap-3 form w-100' onSubmit={verifyOTP}>
                                        {isLoading
                                            ? (
                                                <Loader width='100%' height='auto' />
                                            )
                                            : null}
                                        <OTPInput className='otp-container' value={OTP} onChange={setOTP} autoFocus OTPLength={6} otpType="number"  disabled={false} />
                                        <span className='timer'>
                                            <button onClick={handleLogin} disabled={disabled}>
                                                {timer === 0 ?
                                                    `Resend OTP` : <>Resend OTP in : <strong> {formatTime(timer)} </strong> </>}
                                            </button> </span>
                                        <span className='button-container d-flex gap-5'>

                                            <button type="submit" className='login-btn' >{t("verify_and_proceed")}</button>


                                        </span>
                                    </form>
                                )
                                : (
                                    <form className='d-flex flex-column gap-3 form' onSubmit={handleLogin}>
                                        {isLoading
                                            ? (
                                                <Loader width='100%' height='auto' />
                                            )
                                            : null}


                                        <div>
                                            <PhoneInput
                                                country={"in"}
                                                value={phonenum}
                                                onChange={handleOnChange}
                                                enableSearch
                                                disableSearchIcon
                                                placeholder={t('please_enter_valid_phone_number')}
                                                disableDropdown={false}
                                            />
                                        </div>


                                        <span style={{ alignSelf: "baseline" }}>
                                            <input type="checkbox" className='mx-2' required checked={checkboxSelected} onChange={() => {
                                                setcheckboxSelected(!checkboxSelected)
                                            }} />
                                            {t("agreement_message")} &nbsp;<a onClick={handleTerms}>{t("terms_of_service")}</a> &nbsp;{t("and")}<a onClick={handlePolicy}>&nbsp; {t("privacy_policy")} &nbsp;</a>
                                        </span>
                                        <button type='submit'> {t("login_continue")}</button>
                                    </form>
                                )}


                        </div>
                    </div>
                    <div id="recaptcha-container" style={{ display: "none" }}></div>
                </div>
            </div >

        </>
    )
}

export default Login