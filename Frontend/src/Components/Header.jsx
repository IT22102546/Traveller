/* eslint-disable no-unused-vars */
import { Avatar, Dropdown, DropdownDivider, DropdownHeader, DropdownItem, Navbar } from "flowbite-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { HiShoppingBag, HiUser, HiMenu } from 'react-icons/hi';
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "../redux/user/userSlice";
import { useLocation } from "react-router-dom";
import logoImage from "../assets/images/logo.png";

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await fetch("/api/user/signout");
      dispatch(signOut());
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const imageStyle = {
    height: '300px',
    width: 'auto',
    objectFit: 'contain',
    outline: 'none',
    border: 'none',
  };

  return (
    <Navbar className="border-b-2 relative z-50 bg-green-500 h-20 flex items-center">
      <div className="container mx-auto flex items-center justify-between h-full">

        <div className="flex items-center h-full">
          <NavLink to="/" className="self-center whitespace-nowrap text-3xl font-semibold font-tangerine text-white">
            <img
              src={logoImage}
              alt="Logo"
              style={imageStyle}
            />
          </NavLink>
        </div>

        <div className="flex items-center space-x-8 h-full">
          <div className="hidden md:flex space-x-8 h-full items-center">
            <NavLink to="/" className={({ isActive }) => isActive ? "text-black" : "text-white"}>
              Home
            </NavLink>
           
            <NavLink to="/itinerary" className={({ isActive }) => isActive ? "text-black" : "text-white"}>
              Travel Itinerary
            </NavLink>
            <NavLink to="/expense" className={({ isActive }) => isActive ? "text-black" : "text-white"}>
              Travel Expenses
            </NavLink>

            <NavLink to="/prediction" className={({ isActive }) => isActive ? "text-black" : "text-white"}>
              Activity Predictor
            </NavLink>
          </div>

          <div className="flex items-center space-x-4 h-full">
            {currentUser ? (
              <Dropdown arrowIcon={false} inline label={
                <Avatar alt="user" img={currentUser.profilePicture} rounded className="h-10 w-10" />
              }>
                <DropdownHeader>
                  <span className="block text-sm">{currentUser.username}</span>
                  <span className="block text-sm font-medium truncate">{currentUser.email}</span>
                </DropdownHeader>
                <Link to={'/dashboard?tab=profile'}>
                  <DropdownItem>Profile</DropdownItem>
                </Link>
                <DropdownDivider />
                <DropdownItem onClick={handleSignOut}>Sign Out</DropdownItem>
              </Dropdown>
            ) : (
              <Link to="/sign-in">
                <HiUser className="text-white" />
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <Navbar.Toggle>
              <HiMenu className="text-white text-3xl" />
            </Navbar.Toggle>
          </div>
        </div>
      </div>

      <Navbar.Collapse>
        <div className="flex flex-col space-y-4 md:hidden">
          <NavLink to="/" className={({ isActive }) => isActive ? "text-black" : "text-white"}>
            Home
          </NavLink>
            
          <NavLink to="/itinerary" className={({ isActive }) => isActive ? "text-black" : "text-white"}>
             Travel Itinerary
          </NavLink>

          <NavLink to="/prediction" className={({ isActive }) => isActive ? "text-black" : "text-white"}>
            Activity Predictor
          </NavLink>
        </div>
      </Navbar.Collapse>
    </Navbar>
  );
}