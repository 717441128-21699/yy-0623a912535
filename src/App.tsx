import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CustomerSearch from "@/pages/CustomerSearch";
import CustomerDetail from "@/pages/CustomerDetail";
import CouponRecommend from "@/pages/CouponRecommend";
import VerifyApply from "@/pages/VerifyApply";
import DoctorOrders from "@/pages/DoctorOrders";
import FollowUp from "@/pages/FollowUp";
import Performance from "@/pages/Performance";

export default function App() {
  return (
    <Router>
      <div className="mx-auto max-w-[480px] min-h-screen bg-white relative">
        <Routes>
          <Route path="/" element={<CustomerSearch />} />
          <Route path="/customer/:customerId" element={<CustomerDetail />} />
          <Route path="/coupons/:customerId" element={<CouponRecommend />} />
          <Route path="/verify/:customerId" element={<VerifyApply />} />
          <Route path="/orders" element={<DoctorOrders />} />
          <Route path="/follow-up" element={<FollowUp />} />
          <Route path="/performance" element={<Performance />} />
        </Routes>
      </div>
    </Router>
  );
}
