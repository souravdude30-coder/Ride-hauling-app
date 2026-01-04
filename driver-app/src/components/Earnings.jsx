import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Calendar, Car, ArrowUp, ArrowDown, Clock, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const Earnings = ({ driver }) => {
  const [period, setPeriod] = useState('today');
  const [earnings, setEarnings] = useState({
    today: { total: 856.50, rides: 12, hours: 8.5, tips: 45 },
    week: { total: 5420.00, rides: 78, hours: 52, tips: 320 },
    month: { total: 21850.00, rides: 312, hours: 198, tips: 1250 }
  });

  const [transactions, setTransactions] = useState([
    { id: 1, type: 'ride', amount: 125.50, time: '10:30 AM', from: 'DLF Phase 3', to: 'Cyber Hub' },
    { id: 2, type: 'ride', amount: 85.00, time: '09:15 AM', from: 'Sector 29', to: 'Golf Course Road' },
    { id: 3, type: 'tip', amount: 20.00, time: '09:20 AM', from: 'Tip from passenger' },
    { id: 4, type: 'ride', amount: 210.00, time: '08:00 AM', from: 'IGI Airport T3', to: 'Gurgaon' },
    { id: 5, type: 'bonus', amount: 100.00, time: '07:00 AM', from: 'Peak hour bonus' },
  ]);

  const currentData = earnings[period];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-green-800 text-white p-6">
        <h1 className="text-xl font-bold mb-4">Earnings</h1>
        
        {/* Period Selector */}
        <div className="flex space-x-2 mb-4">
          {['today', 'week', 'month'].map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? 'secondary' : 'ghost'}
              className={period === p ? 'bg-white text-green-700' : 'text-white hover:bg-green-700'}
              onClick={() => setPeriod(p)}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>

        {/* Main Earning */}
        <div className="text-center py-4">
          <p className="text-green-200 text-sm">Total Earnings</p>
          <p className="text-4xl font-bold">₹{currentData.total.toLocaleString()}</p>
          <div className="flex items-center justify-center mt-2 text-green-200">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-sm">+12% from last {period}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-green-700/50 rounded-lg p-3 text-center">
            <Car className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xl font-bold">{currentData.rides}</p>
            <p className="text-xs text-green-200">Rides</p>
          </div>
          <div className="bg-green-700/50 rounded-lg p-3 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xl font-bold">{currentData.hours}h</p>
            <p className="text-xs text-green-200">Online</p>
          </div>
          <div className="bg-green-700/50 rounded-lg p-3 text-center">
            <DollarSign className="w-5 h-5 mx-auto mb-1" />
            <p className="text-xl font-bold">₹{currentData.tips}</p>
            <p className="text-xs text-green-200">Tips</p>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.map((tx, index) => (
              <div key={tx.id} className={`flex items-center justify-between p-4 ${index !== transactions.length - 1 ? 'border-b' : ''}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'ride' ? 'bg-blue-100' :
                    tx.type === 'tip' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    {tx.type === 'ride' ? <Car className="w-5 h-5 text-blue-600" /> :
                     tx.type === 'tip' ? <User className="w-5 h-5 text-yellow-600" /> :
                     <TrendingUp className="w-5 h-5 text-green-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {tx.type === 'ride' ? `${tx.from} → ${tx.to}` : tx.from}
                    </p>
                    <p className="text-xs text-gray-500">{tx.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">+₹{tx.amount}</p>
                  <Badge variant="outline" className="text-xs">{tx.type}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="flex justify-around">
          <a href="/" className="flex flex-col items-center text-gray-500">
            <Car className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </a>
          <a href="/earnings" className="flex flex-col items-center text-green-600">
            <DollarSign className="w-6 h-6" />
            <span className="text-xs mt-1">Earnings</span>
          </a>
          <a href="/profile" className="flex flex-col items-center text-gray-500">
            <User className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
