import React, { useState } from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import cookies from 'react-cookies';
import { HashRouter as Router, Switch, Route, Link, useHistory } from 'react-router-dom';

import SignInPage from './components/signin.component';
import SignUpPage from './components/signup.component';
import JoinRoom from './components/joinRoom';
import RoomList from './components/roomList';
import RoomManage from './components/roomManage';
import meeting from './components/meeting/meeting';

import { Logout } from './communication/communication';

function App() {
    let { isAdmin, username } =
        cookies.load('userData') !== undefined
            ? cookies.load('userData')
            : {
                  isAdmin: '',
                  username: ''
              };
    const history = useHistory();
    return (
        <Router>
            <div className="App">
                <div className="linkMenu">
                    <nav className="navbar navbar-expand-lg navbar-light fixed-top">
                        <div className="container">
                            {username === '' ? (
                                <Link disabled="true" className="navbar-brand" to="/sign-in">
                                    Cool Streaming
                                </Link>
                            ) : (
                                <Link disabled="true" className="navbar-brand" to="/myRoom">
                                    Cool Streaming
                                </Link>
                            )}
                            <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
                                {username === '' && (
                                    <ul className="navbar-nav ml-auto">
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/sign-in">
                                                Sign In
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/sign-up">
                                                Sign up
                                            </Link>
                                        </li>
                                    </ul>
                                )}

                                {username !== '' && (
                                    <ul className="navbar-nav ml-auto">
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/joinRoom">
                                                Join Room
                                            </Link>
                                        </li>
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/myRoom">
                                                My Room
                                            </Link>
                                        </li>
                                        {isAdmin && (
                                            <li className="nav-item">
                                                <Link className="nav-link" to="/roomManage">
                                                    Room Manage
                                                </Link>
                                            </li>
                                        )}
                                        <li className="nav-item">
                                            <Link
                                                className="nav-link"
                                                to="/sign-in"
                                                onClick={() => {
                                                    Logout(username);
                                                    cookies.remove('userData');
                                                    history.push('/');
                                                    location.reload();
                                                }}
                                            >
                                                Logout
                                            </Link>
                                        </li>
                                    </ul>
                                )}
                            </div>
                            {username !== '' && (
                                <Link disabled="true" className="nav-link" to="/myRoom">
                                    Hello! {username}
                                </Link>
                            )}
                        </div>
                    </nav>
                </div>

                <Switch>
                    {username === '' && <Route exact path="/" component={SignInPage} />}
                    {username !== '' && <Route exact path="/" component={RoomList} />}
                    {username === '' && <Route path="/sign-in" component={SignInPage} />}
                    {username === '' && <Route path="/sign-up" component={SignUpPage} />}
                    {username !== '' && <Route path="/joinRoom" component={JoinRoom} />}
                    {username !== '' && <Route path="/myRoom" component={RoomList} />}
                    {username !== '' && <Route path="/roomManage" component={RoomManage} />}
                    {username !== '' && <Route path="/meeting/:name" component={meeting} />}
                </Switch>
            </div>
        </Router>
    );
}

export default App;
