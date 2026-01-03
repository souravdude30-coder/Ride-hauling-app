import React, { useState, useEffect } from 'react';
import { ChevronLeft, Tag, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';

const PassPurchase = ({ onBack }) => {
  const [selectedPass, setSelectedPass] = useState(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const availablePasses = [
    {
      id: 'daily',
      name: 'Daily Pass',
      price: 99,
      description: 'Unlimited rides for 24 hours',
      features: ['Unlimited Rides', 'Valid for 24 hours'],
      discount: null,
    },
    {
      id: 'weekly',
      name: 'Weekly Pass',
      price: 499,
      description: 'Unlimited rides for 7 days',
      features: ['Unlimited Rides', 'Valid for 7 days', '10% off on premium rides'],
      discount: '10% OFF',
    },
    {
      id: 'monthly',
      name: 'Monthly Pass',
      price: 1799,
      description: 'Unlimited rides for 30 days',
      features: ['Unlimited Rides', 'Valid for 30 days', '20% off on premium rides', 'Priority support'],
      discount: '20% OFF',
    },
  ];

  const handlePurchase = async () => {
    if (!selectedPass || !email || !fullName) {
      alert('Please select a pass and fill in your details.');
      return;
    }

    // In a real application, you would make an API call to your backend
    // to create an order and get an order_id from Razorpay.
    // For this example, we'll simulate it.
    const orderAmount = selectedPass.price * 100; // Razorpay expects amount in paisa

    // Simulate backend order creation
    const order = {
      id: `order_${Date.now()}`, // Dummy order ID
      amount: orderAmount,
      currency: 'INR',
    };

    const options = {
      key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your actual Razorpay Key ID
      amount: order.amount,
      currency: order.currency,
      name: 'Ride-Hauling App',
      description: `${selectedPass.name} Purchase`,
      order_id: order.id,
      handler: function (response) {
        alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
        // Here you would typically verify the payment on your backend
        // and then update the user's pass status.
      },
      prefill: {
        name: fullName,
        email: email,
        contact: '9999999999', // Replace with actual user contact if available
      },
      notes: {
        pass_id: selectedPass.id,
        user_email: email,
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-3 p-1">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold">Purchase a Pass</h1>
      </div>

      <div className="px-4 py-6">
        {/* Promotional Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 mb-6 text-white">
          <h2 className="text-xl font-bold mb-2">🚀 Ride More, Pay Less!</h2>
          <p className="text-sm opacity-90 mb-3">Unlock exclusive benefits with our ride passes.</p>
          <Badge className="bg-white text-blue-700 font-bold">Save up to 50%</Badge>
        </div>

        {/* Pass Options */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Choose Your Pass</h3>
          <RadioGroup onValueChange={(value) => setSelectedPass(availablePasses.find(p => p.id === value))} className="space-y-4">
            {availablePasses.map((pass) => (
              <Card
                key={pass.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedPass?.id === pass.id ? 'border-2 border-blue-500 bg-blue-50' : 'border hover:shadow-md'
                }`}
                onClick={() => setSelectedPass(pass)}
              >
                <CardHeader className="flex flex-row items-center justify-between p-0 pb-2">
                  <CardTitle className="text-lg font-bold">{pass.name}</CardTitle>
                  {pass.discount && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {pass.discount}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-2xl font-bold mb-1">₹{pass.price}</p>
                  <p className="text-sm text-gray-600 mb-3">{pass.description}</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {pass.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Info className="w-4 h-4 mr-2 text-blue-500" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <RadioGroupItem value={pass.id} id={pass.id} className="sr-only" />
                </CardContent>
              </Card>
            ))}
          </RadioGroup>
        </div>

        {/* User Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Your Details</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName" className="mb-2 block">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="email" className="mb-2 block">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Purchase Button */}
        <Button
          className="w-full py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
          onClick={handlePurchase}
          disabled={!selectedPass || !email || !fullName}
        >
          Purchase Pass
        </Button>
      </div>
    </div>
  );
};

export default PassPurchase;
