import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import { Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import CheckoutSuccess from "../Subscription/CheckoutSuccess";

const SuccessPage: React.FC = () => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authIsLoading } = useAuth();

  const isResubmission = searchParams.get("resubmit") === "true";
  const isStripeSuccess = searchParams.get("checkout") === "completed";
  const planType = searchParams.get("plan") as "monthly" | "annual" || "monthly";
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (authIsLoading) {
      return;
    }

    // For checkout success, we'll use a longer countdown to give the user time to read
    const countdownDuration = isStripeSuccess ? 10 : 5;
    setCountdown(countdownDuration);

    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          if (user) {
            console.log(
              `[SuccessPage] User logged in, redirecting to /profile. isStripeSuccess=${isStripeSuccess}`
            );
            navigate("/profile");
          } else {
            // Redirect to signup-access with session_id if Stripe checkout
            if (sessionId && isStripeSuccess) {
              navigate(`/signup-access?session_id=${sessionId}`);
            } else {
              navigate("/login");
            }
          }
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, user, authIsLoading, isResubmission, isStripeSuccess, sessionId]);

  if (authIsLoading) {
    return (
      <Layout>
        <div className="bg-gray-900 py-32">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b9b6f] mx-auto mb-4"></div>
            <h1 className="text-3xl font-bold text-white mb-4">
              {isStripeSuccess ? "Verifying payment..." : "Processing..."}
            </h1>
          </div>
        </div>
      </Layout>
    );
  }

  // If this is a Stripe checkout success, show the CheckoutSuccess component
  if (isStripeSuccess) {
    return (
      <Layout>
        <div className="bg-black min-h-screen py-16">
          <div className="container mx-auto px-4">
            <CheckoutSuccess 
              subscriptionType={planType}
              customerName={user?.email?.split('@')[0]}
              redirectTo="/profile"
              redirectLabel={`Go to Profile (${countdown}s)`}
            />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-900 py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <div className="rounded-full bg-[#9b9b6f] p-4">
              <Check size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            {isResubmission
              ? "Thank You for Your Resubmission!"
              : "Thank You for Your Submission!"}
          </h1>
          <p className="text-gray-400 text-xl mb-8 max-w-2xl mx-auto">
            Your video is being reviewed by our team. You'll be notified once a
            decision has been made. Good luck! You will be redirected to your profile page in{" "}
            {countdown} seconds.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default SuccessPage;