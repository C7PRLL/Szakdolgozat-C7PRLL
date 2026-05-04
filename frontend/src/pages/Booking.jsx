import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function Booking() {
    const user = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    
    const [activityType, setActivityType] = useState('Bérgokart');
    const [bookingDate, setBookingDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('10:00 - 12:00');

    const slots = {
        'Bérgokart': ['08:00 - 10:00', '10:00 - 12:00', '13:00 - 15:00', '15:00 - 17:00'],
        'Versenygokart': ['08:00 - 08:30', '09:00 - 09:30', '10:00 - 10:30'],
        'Verseny csomag': ['09:00 - 11:00', '14:00 - 16:00']
    };

    useEffect(() => {
        setTimeSlot(slots[activityType][0]);
    }, [activityType]);

    useEffect(() => {
        if (!user) navigate('/login');
        else fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/bookings/my-bookings/${user.id}`);
            const formattedEvents = res.data.map(b => {
                const times = b.time_slot.split(' - ');
                return {
                    id: b.id,
                    title: b.activity_type,
                    start: `${b.booking_date}T${times[0]}:00`,
                    end: `${b.booking_date}T${times[1]}:00`,
                    backgroundColor: b.activity_type === 'Verseny csomag' ? '#e44c65' : '#39c088',
                    borderColor: 'transparent'
                };
            });
            setEvents(formattedEvents);
        } catch (err) {
            console.error("Hiba:", err);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/bookings', {
                user_id: user.id,
                activity_type: activityType,
                booking_date: bookingDate,
                time_slot: timeSlot
            });
            alert("Sikeres foglalás!");
            fetchBookings();
        } catch (err) {
            alert("Hiba történt a mentéskor.");
        }
    };

    if (!user) return null;

    return (
        <div id="main" className="wrapper">
            <div className="container">
                <header className="major">
                    <h2>Időpontfoglalás</h2>
                    <p>Válaszd ki a típust és az időpontot</p>
                </header>

                <section className="glass-box" style={{ maxWidth: '800px', margin: '0 auto', padding: '2em' }}>
                    <form onSubmit={handleBooking}>
                        <label>Mivel szeretnél menni?</label>
                        <select value={activityType} onChange={(e) => setActivityType(e.target.value)}>
                            <option value="Bérgokart">Bérgokart (Standard)</option>
                            <option value="Versenygokart">Versenygokart (Pro)</option>
                            <option value="Verseny csomag">Verseny csomag (Gyakorlás)</option>
                        </select>

                        <label>Dátum</label>
                        <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required />

                        <label>Elérhető idősávok</label>
                        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                            {slots[activityType].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <button type="submit" className="button primary">
                            Időpont véglegesítése
                        </button>
                    </form>
                </section>

                <div className="calendar-container">
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        locale="hu"
                        buttonText={{ today: 'Ma', month: 'Hónap', week: 'Hét', day: 'Nap' }}
                        events={events}
                        slotMinTime="08:00:00"
                        slotMaxTime="20:00:00"
                        allDaySlot={false}
                        height="auto"
                    />
                </div>
            </div>
        </div>
    );
}

export default Booking;