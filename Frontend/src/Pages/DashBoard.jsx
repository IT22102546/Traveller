import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashSideBar from "../Components/DashSideBar";
import DashProfile from "../Components/DashProfile";
import DashItinary from "../Components/DashItinary";
import MyPayments from "../Components/MyPayments";
import FullPaymentRecievedTrips from "../Components/FullPaymentRecievedTrips";
import DashCompletedOrders from "../Components/DashCompletedOrders";

export default function DashBoard() {
  const location = useLocation();
  const [tab, setTab] = useState();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-56">
        <DashSideBar />
      </div>
      {tab === "profile" && <DashProfile/>}
      {tab === "itinary" && <DashItinary />}
      {tab === "mypayments" && <MyPayments />}
      {tab === "fullpayrecieved" && <FullPaymentRecievedTrips />}
      {tab === "completedorders" && <DashCompletedOrders />}
    </div>
  );
}
