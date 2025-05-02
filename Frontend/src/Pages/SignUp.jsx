import { useState } from "react";
import { Alert, Button, Label, TextInput, Spinner } from "flowbite-react";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
    const [formData, setFormData] = useState({});
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.email || !formData.password || !formData.mobile || !formData.adress) {
            return setError('Please fill all fields');
        }

        try {
            setLoading(true);
            setError(false);
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            setLoading(false);
            if (data.success === false) {
                setError(data.message);
                return;
            }
            navigate('/sign-in');
        } catch (error) {
            setLoading(false);
            setError(error.message);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 px-4"
        >
            <div className="p-8 max-w-lg w-full bg-white bg-opacity-80 backdrop-blur-md rounded-2xl shadow-2xl">
                <h1 className="text-center text-3xl font-semibold text-gray-800 font-cinzel mb-6">Create an Account</h1>
                
                <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div>
                        <Label value="Username" />
                        <TextInput type="text" placeholder="Username" id="username" onChange={handleChange} />
                    </div>

                    <div>
                        <Label value="Email" />
                        <TextInput type="email" placeholder="name@company.com" id="email" onChange={handleChange} />
                    </div>

                    <div>
                        <Label value="Address" />
                        <TextInput type="text" placeholder="Address" id="adress" onChange={handleChange} />
                    </div>

                    <div>
                        <Label value="Mobile Number" />
                        <TextInput type="text" placeholder="07X XXX XXXX" id="mobile" onChange={handleChange} />
                    </div>

                    <div>
                        <Label value="Password" />
                        <div className="relative">
                            <TextInput
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                id="password"
                                onChange={handleChange}
                                className="pr-10"
                            />
                            <button
                                type="button"
                                className="absolute top-2.5 right-3 text-gray-500"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10a9.965 9.965 0 011.824-5.825M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 2l20 20" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.5c5.185 0 9.448 4.014 9.95 9.048a.944.944 0 010 .904C21.448 16.486 17.185 20.5 12 20.5S2.552 16.486 2.05 13.452a.944.944 0 010-.904C2.552 8.514 6.815 4.5 12 4.5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12.75a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <Button
                        disabled={loading}
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                        {loading ? (
                            <>
                                <Spinner size="sm" />
                                <span className="pl-3">Signing up...</span>
                            </>
                        ) : (
                            'Sign Up'
                        )}
                    </Button>
                </form>

                <div className="flex justify-center gap-1 text-sm mt-5 text-gray-700">
                    <span>Already have an account?</span>
                    <Link to="/sign-in" className="text-blue-600 font-medium hover:underline">
                        Sign In
                    </Link>
                </div>

                {error && (
                    <Alert className="mt-5" color="failure">
                        {error}
                    </Alert>
                )}
            </div>
        </div>
    );
}
