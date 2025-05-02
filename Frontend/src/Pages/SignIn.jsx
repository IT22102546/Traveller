import { Alert, Button, Label, Spinner, TextInput } from "flowbite-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInStart, signInSuccess, singInFailure } from '../redux/user/userSlice';
import { useDispatch, useSelector } from 'react-redux';

export default function SignIn() {
    const [formData, setFormData] = useState({});
    const { loading, error } = useSelector((state) => state.user);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            dispatch(singInFailure("Please fill all fields"));
            return;
        }
        try {
            dispatch(signInStart());
            const res = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await res.json();
            if (data.success === false) {
                dispatch(singInFailure(data.message));
                return;
            }
            dispatch(signInSuccess(data));
            navigate('/');
        } catch (error) {
            dispatch(singInFailure(error.message));
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100">
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border border-gray-200">
                <p className="text-center text-3xl font-semibold text-gray-700 mb-2">Welcome Back</p>
                <p className="text-center text-gray-500 mb-6 text-sm">Sign in to continue to your account</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <Label value="Email" className="text-sm text-gray-700 mb-1 block" />
                        <TextInput
                            type="email"
                            placeholder="you@example.com"
                            id="email"
                            onChange={handleChange}
                            color="gray"
                            required
                        />
                    </div>
                    <div>
                        <Label value="Password" className="text-sm text-gray-700 mb-1 block" />
                        <div className="relative">
                            <TextInput
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                id="password"
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.962 9.962 0 013.742-7.741M16.243 9.757A4 4 0 019.757 16.243M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.269 2.943 9.543 7-.83 2.609-2.626 4.89-5.153 6.325M15.5 19.75l-1.75-1.75" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" gradientDuoTone="cyanToBlue" disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner size="sm" />
                                <span className="pl-3">Signing In...</span>
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>

               
                <div className="text-sm text-center text-gray-600 mt-2">
                    Don't have an account?{" "}
                    <Link to="/sign-up" className="text-blue-600 hover:underline">Sign Up</Link>
                </div>

                {error && (
                    <Alert color="failure" className="mt-5">
                        {error}
                    </Alert>
                )}
            </div>
        </div>
    );
}
