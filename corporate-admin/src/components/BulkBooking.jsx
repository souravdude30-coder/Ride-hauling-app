import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { PlusCircle, Upload, Trash2, Download } from 'lucide-react';

const BulkBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [newBooking, setNewBooking] = useState({
    employeeId: '',
    pickup: '',
    destination: '',
    time: '',
    date: '',
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setNewBooking((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddBooking = () => {
    if (newBooking.employeeId && newBooking.pickup && newBooking.destination && newBooking.time && newBooking.date) {
      setBookings((prev) => [...prev, { ...newBooking, id: Date.now() }]);
      setNewBooking({ employeeId: '', pickup: '', destination: '', time: '', date: '' });
    } else {
      alert('Please fill in all fields for the new booking.');
    }
  };

  const handleDeleteBooking = (id) => {
    setBookings((prev) => prev.filter((booking) => booking.id !== id));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csvContent = event.target.result;
          // Assuming CSV format: employeeId,pickup,destination,time,date
          const lines = csvContent.split('\n').filter(line => line.trim() !== '');
          const parsedBookings = lines.slice(1).map((line) => {
            const [employeeId, pickup, destination, time, date] = line.split(',');
            return { id: Date.now() + Math.random(), employeeId, pickup, destination, time, date };
          });
          setBookings((prev) => [...prev, ...parsedBookings]);
        } catch (error) {
          alert('Error parsing CSV file. Please ensure it is correctly formatted.');
          console.error('CSV parsing error:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadTemplate = () => {
    const csvHeader = "employeeId,pickup,destination,time,date\n";
    const csvContent = csvHeader + "EMP001,Office A,Client Site B,10:00,2024-01-15\nEMP002,Home,Office A,09:30,2024-01-15";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'bulk_booking_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmitBulkBookings = () => {
    if (bookings.length > 0) {
      alert(`Submitting ${bookings.length} bulk bookings.`);
      // Here you would typically send the bookings data to your backend API
      console.log('Bulk Bookings Submitted:', bookings);
      setBookings([]); // Clear bookings after submission
    } else {
      alert('No bookings to submit.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Corporate Bulk Booking</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Single Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input id="employeeId" value={newBooking.employeeId} onChange={handleInputChange} placeholder="E.g., EMP001" />
            </div>
            <div>
              <Label htmlFor="pickup">Pickup Location</Label>
              <Input id="pickup" value={newBooking.pickup} onChange={handleInputChange} placeholder="E.g., Office Main Gate" />
            </div>
            <div>
              <Label htmlFor="destination">Destination</Label>
              <Input id="destination" value={newBooking.destination} onChange={handleInputChange} placeholder="E.g., Client Site A" />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={newBooking.date} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={newBooking.time} onChange={handleInputChange} />
            </div>
          </div>
          <Button onClick={handleAddBooking} className="w-full">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Booking
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Bookings via CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-4">
            <Input id="csvFile" type="file" accept=".csv" onChange={handleFileUpload} className="flex-grow" />
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" /> Download Template
            </Button>
          </div>
          <p className="text-sm text-gray-500">Upload a CSV file with columns: employeeId,pickup,destination,time,date</p>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Pending Bulk Bookings ({bookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <p className="text-center text-gray-500">No bookings added yet.</p>
          ) : (
            <>
              <div className="overflow-x-auto mb-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Pickup</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{booking.employeeId}</TableCell>
                        <TableCell>{booking.pickup}</TableCell>
                        <TableCell>{booking.destination}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>{booking.time}</TableCell>
                        <TableCell>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteBooking(booking.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Button onClick={handleSubmitBulkBookings} className="w-full">
                Submit All Bookings
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkBooking;
