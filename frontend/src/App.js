import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import BookingForm from "./components/BookingForm";
import RideOptions from "./components/RideOptions";
import RideTracking from "./components/RideTracking";
import ShuttleBooking from "./components/ShuttleBooking";
import ShuttleTracking from "./components/ShuttleTracking";
import ReserveRide from "./components/ReserveRide";
import UberShare from "./components/UberShare";
import BikeBooking from "./components/BikeBooking";
import TotoBooking from "./components/TotoBooking";
import DeliveryBooking from "./components/DeliveryBooking";
import { Toaster } from "./components/ui/toaster";

const Home = () => {
  const [currentScreen, setCurrentScreen] = useState('home'); // home, booking, options, tracking
  const [bookingDetails, setBookingDetails] = useState(null);
  const [selectedRide, setSelectedRide] = useState(null);

  const handleBookRide = (details) => {
    setBookingDetails(details);
    setCurrentScreen('options');
  };

  const handleSelectRide = (rideType) => {
    setSelectedRide(rideType);
    setCurrentScreen('tracking');
  };

  const handleBack = () => {
    setCurrentScreen('home');
  };

  const handleRideComplete = () => {
    // Reset to home screen after ride completion
    setTimeout(() => {
      setCurrentScreen('home');
      setBookingDetails(null);
      setSelectedRide(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile-First Design matching Uber India */}
      {currentScreen === 'home' && (
        <div className="pb-20"> {/* Space for bottom navigation */}
          {/* Top Search Section */}
          <div className="bg-white px-4 pt-12 pb-6">
            <div className="flex items-center space-x-3 bg-gray-100 rounded-full px-4 py-3">
              <div className="w-6 h-6">🔍</div>
              <input
                placeholder="Where to?"
                className="flex-1 bg-transparent text-gray-700 placeholder-gray-500 text-lg font-medium focus:outline-none"
                onClick={() => setCurrentScreen('booking')}
              />
              <div className="bg-white px-3 py-1 rounded-full">
                <span className="text-sm font-medium">Later</span>
              </div>
            </div>
          </div>

          {/* Recent/Saved Locations */}
          <div className="px-4 mb-6">
            <div className="flex items-center space-x-3 py-3 border-b border-gray-100">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm">🏥</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">Fortis Hospital, Anandapur - Best Hospital in Kolkata</div>
                <div className="text-sm text-gray-500">730, Eastern Metropolitan Bypass, An...</div>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="px-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Suggestions</h2>
              <span className="text-blue-600 font-medium">See all</span>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              {/* Row 1 */}
              <div className="relative bg-gray-100 rounded-2xl p-4 aspect-square flex flex-col items-center justify-center cursor-pointer"
                   onClick={() => setCurrentScreen('booking')}>
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">15%</div>
                <div className="text-2xl mb-2">🚗</div>
                <span className="text-sm font-medium text-center">Trip</span>
              </div>
              
              <div className="bg-gray-100 rounded-2xl p-4 aspect-square flex flex-col items-center justify-center cursor-pointer"
                   onClick={() => setCurrentScreen('bike')}>
                <div className="text-2xl mb-2">🏍️</div>
                <span className="text-sm font-medium text-center">Bike</span>
              </div>
              
              <div className="bg-gray-100 rounded-2xl p-4 aspect-square flex flex-col items-center justify-center cursor-pointer"
                   onClick={() => setCurrentScreen('shuttle')}>
                <div className="text-2xl mb-2">🚌</div>
                <span className="text-sm font-medium text-center">Shuttle</span>
              </div>
              
              <div className="bg-gray-100 rounded-2xl p-4 aspect-square flex flex-col items-center justify-center cursor-pointer"
                   onClick={() => setCurrentScreen('rentals')}>
                <div className="text-2xl mb-2">🚙</div>
                <span className="text-sm font-medium text-center">Rentals</span>
              </div>

              {/* Row 2 */}
              <div className="bg-gray-100 rounded-2xl p-4 aspect-square flex flex-col items-center justify-center cursor-pointer"
                   onClick={() => setCurrentScreen('delivery')}>
                <div className="text-2xl mb-2">📦</div>
                <span className="text-sm font-medium text-center">Send items</span>
              </div>
              
              <div className="bg-gray-100 rounded-2xl p-4 aspect-square flex flex-col items-center justify-center cursor-pointer"
                   onClick={() => setCurrentScreen('intercity')}>
                <div className="text-2xl mb-2">🚗</div>
                <span className="text-sm font-medium text-center">Intercity</span>
              </div>
              
              <div className="bg-gray-100 rounded-2xl p-4 aspect-square flex flex-col items-center justify-center cursor-pointer"
                   onClick={() => setCurrentScreen('toto')}>
                <div className="text-2xl mb-2">🛺</div>
                <span className="text-sm font-medium text-center">Toto</span>
              </div>
              
              <div className="bg-gray-100 rounded-2xl p-4 aspect-square flex flex-col items-center justify-center cursor-pointer"
                   onClick={() => setCurrentScreen('store')}>
                <div className="text-2xl mb-2">🏪</div>
                <span className="text-sm font-medium text-center">Store pick-up</span>
              </div>
            </div>

            {/* Promotional Banner */}
            <div className="bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl p-6 flex items-center justify-between text-white mb-6">
              <div>
                <h3 className="text-lg font-bold mb-1">When you need more room</h3>
                <button className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium text-sm">
                  Request UberXL
                </button>
              </div>
              <div className="text-4xl">🚗</div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
            <div className="grid grid-cols-4 py-2">
              <button className="flex flex-col items-center py-2">
                <div className="text-xl mb-1">🏠</div>
                <span className="text-xs font-semibold text-black">Home</span>
              </button>
              <button className="flex flex-col items-center py-2">
                <div className="text-xl mb-1">⚡</div>
                <span className="text-xs text-gray-500">Services</span>
              </button>
              <button className="flex flex-col items-center py-2">
                <div className="text-xl mb-1">📋</div>
                <span className="text-xs text-gray-500">Activity</span>
              </button>
              <button className="flex flex-col items-center py-2">
                <div className="text-xl mb-1">👤</div>
                <span className="text-xs text-gray-500">Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other Screens */}
      {currentScreen === 'booking' && (
        <BookingForm onBookRide={handleBookRide} />
      )}
      {currentScreen === 'options' && (
        <RideOptions 
          bookingDetails={bookingDetails}
          onSelectRide={handleSelectRide}
          onBack={() => setCurrentScreen('home')}
        />
      )}
      {currentScreen === 'tracking' && (
        <RideTracking 
          onRideComplete={handleRideComplete}
        />
      )}
      {currentScreen === 'shuttle' && (
        <ShuttleBooking onBack={() => setCurrentScreen('home')} />
      )}
      {currentScreen === 'shuttle-tracking' && (
        <ShuttleTracking onBack={() => setCurrentScreen('home')} />
      )}
      {currentScreen === 'reserve' && (
        <ReserveRide onBack={() => setCurrentScreen('home')} />
      )}
      {currentScreen === 'share' && (
        <UberShare onBack={() => setCurrentScreen('home')} />
      )}
      
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
