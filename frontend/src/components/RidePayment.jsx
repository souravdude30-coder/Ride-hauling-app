import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RidePayment = ({ rideDetails, onPaymentSuccess, onPaymentFailure, onBack }) => {
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error('Razorpay SDK failed to load.');
      toast({
        title: 'Payment Error',
        description: 'Failed to load payment gateway. Please try again later.',
        variant: 'destructive',
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [toast]);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast({
        title: 'Payment Gateway Not Ready',
        description: 'Please wait while the payment gateway loads.',
        variant: 'warning',
      });
      return;
    }

    if (!rideDetails || !rideDetails.fare) {
      toast({
        title: 'Payment Error',
        description: 'Ride details or fare not available.',
        variant: 'destructive',
      });
      return;
    }

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Replace with your actual Razorpay Key ID
      amount: rideDetails.fare * 100, // amount in smallest currency unit (e.g., paise for INR)
      currency: 'INR',
      name: 'Ride-Hauling App',
      description: `Payment for ride from ${rideDetails.pickup.address} to ${rideDetails.destination.address}`,
      image: 'https://example.com/your_logo', // Replace with your logo
      handler: function (response) {
        // Handle successful payment
        toast({
          title: 'Payment Successful!',
          description: `Payment ID: ${response.razorpay_payment_id}`,
          action: <CheckCircle className="text-green-500" />,
        });
        onPaymentSuccess && onPaymentSuccess(response.razorpay_payment_id);
      },
      prefill: {
        name: 'John Doe', // Replace with actual user name
        email: 'john.doe@example.com', // Replace with actual user email
        contact: '9999999999', // Replace with actual user contact
      },
      notes: {
        ride_id: rideDetails.id, // Assuming rideDetails has an ID
      },
      theme: {
        color: '#3399CC',
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Complete Your Ride Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {rideDetails ? (
            <>
              <div className="text-center text-gray-700">
                <p className="text-lg">Your ride from <span className="font-semibold">{rideDetails.pickup.address}</span> to <span className="font-semibold">{rideDetails.destination.address}</span> is complete.</p>
                <p className="text-xl font-bold mt-2">Total Fare: ₹{rideDetails.fare ? rideDetails.fare.toFixed(2) : 'N/A'}</p>
              </div>
              <Button
                onClick={handlePayment}
                className="w-full bg-black text-white hover:bg-gray-800 py-3 text-lg"
                disabled={!razorpayLoaded || !rideDetails.fare}
              >
                Pay Now with Razorpay
              </Button>
            </>
          ) : (
            <div className="text-center text-red-500">
              <XCircle className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg font-semibold">No ride details available for payment.</p>
              <Button onClick={onBack} className="mt-4">Go Back</Button>
            </div>
          )}
          <Button variant="outline" onClick={onBack} className="w-full">
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RidePayment;
