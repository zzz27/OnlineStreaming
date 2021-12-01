import { useState } from 'react';
import './signin.component.css';
import { useHistory } from 'react-router-dom';
import cookies from 'react-cookies';
import { Alert, AlertColor } from '@mui/material';
import { SignIn } from "../communication/communication"

function SignInPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const history = useHistory();
    const [showPopUp, setShowPopUp] = useState(false);
    const [popUp, setPopUp] = useState<AlertColor>('error');
    const [alterText, setAlterText] = useState('');

    return (
        <div className="auth-wrapper">
            {showPopUp && (
                <Alert
                    severity={popUp}
                    onClose={() => {
                        setShowPopUp(false);
                    }}
                >
                    {alterText}
                </Alert>
            )}
            <div className="auth-inner">
                <form>
                    <h3>Sign In</h3>

                    <div className="form-group1"> 
                        <label>Username</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter Username"
                            onChange={(event) => {
                                setUsername(event.target.value);
                            }}
                        />
                    </div>

                    <div className="form-group2">
                        <label>Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter Password"
                            onChange={(event) => {
                                setPassword(event.target.value);
                            }}
                        />
                    </div>
                        
                    <div className="form-group3">
                        <div className="d-flex justify-content-center">
                            <button
                                type="button"
                                className="btn btn-primary btn-block"
                                onClick={() => {
                                    if (username === '') {
                                        console.log('Username should not be empty!');
                                        setPopUp('error');
                                        setAlterText('Username should not be empty!');
                                        setShowPopUp(true);
                                    } else if (password === '') {
                                        console.log('Password should not be empty!');
                                        setPopUp('error');
                                        setAlterText('Password should not be empty!');
                                        setShowPopUp(true);
                                    } else {
                                        SignIn(username, password)
                                        .then(
                                            (response) => {
                                                const userData = response.data.data;
                                                console.log(userData);
                                                console.log('login success!');
                                                cookies.save('userData', userData, {
                                                    expires: new Date(
                                                        new Date().getTime() + 3600 * 4000
                                                    )
                                                });
                                                history.push(`/joinRoom`);
                                                location.reload()
                                                setPopUp('success');
                                                setAlterText('login success!');
                                                setShowPopUp(true);
                                            }
                                        )
                                        .catch(
                                            (response) => {
                                                setPopUp('error');
                                                setAlterText(response.data.data);
                                                setShowPopUp(true);
                                            }
                                        )
                                    }
                                }}
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignInPage;
