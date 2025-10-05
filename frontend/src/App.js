import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import BookingForm from "./components/BookingForm";
import RideOptions from "./components/RideOptions";
import RideTracking from "./components/RideTracking";
import ShuttleBooking from "./components/ShuttleBooking";
import ShuttleTracking from "./components/ShuttleTracking";
import { Toaster } from "./components/ui/toaster";

const Home = () => {
  const [currentScreen, setCurrentScreen] = useState('booking'); // booking, options, tracking
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
    setCurrentScreen('booking');
  };

  const handleRideComplete = () => {
    // Reset to booking screen after ride completion
    setTimeout(() => {
      setCurrentScreen('booking');
      setBookingDetails(null);
      setSelectedRide(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="flex items-center justify-between max-w-7xl mx-auto px-6 py-12">
        <div className="flex-1">
          {currentScreen === 'booking' && (
            <BookingForm onBookRide={handleBookRide} />
          )}
          {currentScreen === 'options' && (
            <RideOptions 
              bookingDetails={bookingDetails}
              onSelectRide={handleSelectRide}
              onBack={handleBack}
            />
          )}
          {currentScreen === 'tracking' && (
            <RideTracking 
              onRideComplete={handleRideComplete}
            />
          )}
          {currentScreen === 'shuttle' && (
            <ShuttleBooking onBack={handleBack} />
          )}
          {currentScreen === 'shuttle-tracking' && (
            <ShuttleTracking onBack={handleBack} />
          )}
        </div>
        
        {currentScreen === 'booking' && (
          <div className="hidden lg:block flex-1 ml-12">
            <img 
              src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
              alt="Uber ride illustration"
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
        )}
      </main>

      {/* Services section */}
      {currentScreen === 'booking' && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold mb-8">Suggestions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-lg font-semibold mb-2">Ride</h3>
              <p className="text-gray-600 text-sm">Go anywhere with Uber. Request a ride, hop in, and go.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">🕒</div>
              <h3 className="text-lg font-semibold mb-2">Reserve</h3>
              <p className="text-gray-600 text-sm">Reserve your ride in advance so you can relax on the day of your trip.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                 onClick={() => setCurrentScreen('shuttle')}>
              <div className="text-4xl mb-4">🚐</div>
              <h3 className="text-lg font-semibold mb-2">Shuttle</h3>
              <p className="text-gray-600 text-sm">Book daily commute shuttles. Fixed routes, AC buses, advance booking up to 7 days.</p>
            </div>
          </div>
        </section>
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
