// Mock data for Uber clone

export const mockUser = {
  id: "user_123",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  rating: 4.8,
  profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  recentLocations: [
    { id: 1, name: "Home", address: "123 Main St, San Francisco, CA" },
    { id: 2, name: "Work", address: "456 Market St, San Francisco, CA" },
    { id: 3, name: "Airport", address: "San Francisco International Airport" }
  ]
};

export const mockDrivers = [
  {
    id: "driver_1",
    name: "Maria Rodriguez",
    rating: 4.9,
    vehicle: {
      make: "Toyota",
      model: "Camry",
      color: "Silver",
      plate: "ABC-123",
      year: 2021
    },
    location: { lat: 37.7749, lng: -122.4194 },
    eta: "3 min",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
  },
  {
    id: "driver_2",
    name: "David Chen",
    rating: 4.7,
    vehicle: {
      make: "Honda",
      model: "Accord",
      color: "Black",
      plate: "XYZ-789",
      year: 2020
    },
    location: { lat: 37.7849, lng: -122.4094 },
    eta: "5 min",
    profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=David"
  }
];

export const mockRideTypes = [
  {
    id: "uberx",
    name: "UberX",
    description: "Affordable, everyday rides",
    capacity: 4,
    eta: "3 min",
    price: 12.45,
    surge: false,
    icon: "🚗"
  },
  {
    id: "shuttle",
    name: "Uber Shuttle",
    description: "Shared rides along popular routes",
    capacity: 6,
    eta: "8 min", 
    price: 6.99,
    surge: false,
    icon: "🚐",
    savings: "40% cheaper"
  },
  {
    id: "comfort",
    name: "Comfort",
    description: "Newer cars with extra legroom",
    capacity: 4,
    eta: "5 min",
    price: 16.80,
    surge: false,
    icon: "🚙"
  },
  {
    id: "xl",
    name: "UberXL", 
    description: "6 seats",
    capacity: 6,
    eta: "4 min",
    price: 18.90,
    surge: true,
    surgeMultiplier: 1.2,
    icon: "🚗"
  }
];

export const mockLocations = [
  {
    id: 1,
    name: "San Francisco International Airport",
    address: "San Francisco, CA 94128",
    coordinates: { lat: 37.6213, lng: -122.3790 }
  },
  {
    id: 2, 
    name: "Union Square",
    address: "333 Post St, San Francisco, CA 94108",
    coordinates: { lat: 37.7880, lng: -122.4074 }
  },
  {
    id: 3,
    name: "Golden Gate Bridge",
    address: "Golden Gate Bridge, San Francisco, CA",
    coordinates: { lat: 37.8199, lng: -122.4783 }
  },
  {
    id: 4,
    name: "Fisherman's Wharf",
    address: "Pier 39, San Francisco, CA 94133", 
    coordinates: { lat: 37.8087, lng: -122.4098 }
  }
];

export const mockRides = [
  {
    id: "ride_001",
    date: "2024-01-15",
    time: "2:30 PM",
    from: "Union Square",
    to: "SFO Airport",
    driver: "Maria Rodriguez",
    fare: 45.20,
    type: "UberX",
    status: "completed"
  },
  {
    id: "ride_002", 
    date: "2024-01-12",
    time: "9:15 AM",
    from: "Home",
    to: "Market St Office",
    driver: "David Chen", 
    fare: 8.95,
    type: "Uber Shuttle",
    status: "completed"
  },
  {
    id: "ride_003",
    date: "2024-01-10", 
    time: "6:45 PM",
    from: "Financial District",
    to: "Mission District",
    driver: "Sarah Johnson",
    fare: 15.60,
    type: "Comfort",
    status: "completed"
  }
];

export const mockPaymentMethods = [
  {
    id: "pm_1",
    type: "card",
    brand: "visa",
    last4: "4242",
    isDefault: true
  },
  {
    id: "pm_2", 
    type: "card",
    brand: "mastercard",
    last4: "5555",
    isDefault: false
  },
  {
    id: "pm_3",
    type: "paypal",
    email: "john.doe@example.com",
    isDefault: false
  }
];

export const mockCurrentRide = {
  id: "ride_current",
  status: "driver_assigned", // booking, driver_assigned, driver_arriving, in_progress, completed
  driver: mockDrivers[0],
  rideType: mockRideTypes[1], // Shuttle
  pickup: {
    address: "123 Main St, San Francisco, CA",
    coordinates: { lat: 37.7749, lng: -122.4194 }
  },
  destination: {
    address: "456 Market St, San Francisco, CA", 
    coordinates: { lat: 37.7849, lng: -122.4094 }
  },
  fare: 6.99,
  eta: "8 min",
  driverEta: "3 min",
  passengers: [
    { name: "John D.", pickup: "Main St", destination: "Market St" },
    { name: "Sarah M.", pickup: "2nd St", destination: "Mission St" }
  ]
};