import React, { useState } from 'react';
import './AuthPage.css';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AuthPage({ onLoginSuccess }) {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Form inputs
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [signupName, setSignupName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    const navigate = useNavigate();

    const displayMessage = (msg) => {
        setMessage(msg);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email: signupEmail,
            password: signupPassword,
            options: {
                data: { full_name: signupName }
            }
        });
        setIsLoading(false);

        if (error) {
            displayMessage(error.message);
        } else {
            displayMessage('Account Created! Please check email or login.');
            setIsRightPanelActive(false); // Switch to login
        }
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: loginEmail,
            password: loginPassword,
        });
        setIsLoading(false);

        if (error) {
            displayMessage(error.message);
        } else {
            displayMessage('Login Successful!');
            if (onLoginSuccess) {
                onLoginSuccess(data.session);
            }
            navigate('/');
        }
    };

    return (
        <div className={`auth-body`}>
            <div className={`auth-message-box ${showMessage ? 'auth-show' : ''}`}>
                {message}
            </div>

            <div className={`auth-container ${isRightPanelActive ? 'right-panel-active' : ''}`} id="auth-container">
                
                {/* Sign Up Container */}
                <div className="auth-form-container auth-sign-up-container">
                    <form onSubmit={handleSignUp}>
                        <h2>Create Account</h2>
                        <div className="auth-social-login">
                            <a href="#" className="auth-social-btn"><i className="fab fa-google"></i></a>
                            <a href="#" className="auth-social-btn"><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className="auth-social-btn"><i className="fab fa-linkedin-in"></i></a>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--auth-text-secondary)', marginBottom: '15px' }}>or use your email for registration</span>
                        
                        <div className="auth-input-group">
                            <input type="text" placeholder="Name" required value={signupName} onChange={(e) => setSignupName(e.target.value)} />
                            <i className="fas fa-user"></i>
                        </div>
                        <div className="auth-input-group">
                            <input type="email" placeholder="Email" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
                            <i className="fas fa-envelope"></i>
                        </div>
                        <div className="auth-input-group">
                            <input type="password" placeholder="Password" required value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
                            <i className="fas fa-lock"></i>
                        </div>
                        
                        <button className="auth-btn" style={{ marginTop: '10px' }} disabled={isLoading}>
                            {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Sign Up'}
                        </button>
                        <div className="auth-mobile-toggle" onClick={() => setIsRightPanelActive(false)}>Already have an account? Sign In</div>
                    </form>
                </div>

                {/* Sign In Container */}
                <div className="auth-form-container auth-sign-in-container">
                    <form onSubmit={handleSignIn}>
                        <div className="auth-logo">
                            <i className="fas fa-fingerprint"></i>
                        </div>
                        <h2>Sign in</h2>
                        <div className="auth-social-login">
                            <a href="#" className="auth-social-btn"><i className="fab fa-google"></i></a>
                            <a href="#" className="auth-social-btn"><i className="fab fa-facebook-f"></i></a>
                            <a href="#" className="auth-social-btn"><i className="fab fa-linkedin-in"></i></a>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--auth-text-secondary)', marginBottom: '15px' }}>or use your account</span>
                        
                        <div className="auth-input-group">
                            <input type="email" placeholder="Email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                            <i className="fas fa-envelope"></i>
                        </div>
                        <div className="auth-input-group">
                            <input type="password" placeholder="Password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
                            <i className="fas fa-lock"></i>
                        </div>
                        
                        <a href="#" className="auth-footer-link">Forgot your password?</a>
                        <button className="auth-btn" style={{ marginTop: '20px' }} disabled={isLoading}>
                            {isLoading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Sign In'}
                        </button>
                        <div className="auth-mobile-toggle" onClick={() => setIsRightPanelActive(true)}>Don't have an account? Sign Up</div>
                    </form>
                </div>

                {/* Overlay Container */}
                <div className="auth-overlay-container">
                    <div className="auth-overlay">
                        <div className="auth-overlay-panel auth-overlay-left">
                            <h1>Welcome Back!</h1>
                            <p>To keep connected with us please login with your personal info</p>
                            <button className="auth-btn auth-ghost" onClick={() => setIsRightPanelActive(false)}>Sign In</button>
                        </div>
                        <div className="auth-overlay-panel auth-overlay-right">
                            <h1>Hello, Friend!</h1>
                            <p>Enter your personal details and start journey with us</p>
                            <button className="auth-btn auth-ghost" onClick={() => setIsRightPanelActive(true)}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
