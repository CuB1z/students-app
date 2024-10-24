import styles from '@styles/Calendar/Calendar.module.css';
import { useState, useEffect } from 'react';
import { fake_data as initialData } from '@utils/fake_calendar';
import MonthlyView from '@components/react/Calendar/MonthlyView.jsx';
import WeeklyView from '@components/react/Calendar/WeeklyView.jsx';
import AddEventForm from '@components/react/Calendar/AddEventForm.jsx';
import Button from '@components/react/Button.jsx';


export default function Calendar() {
  const [calendarData, setCalendarData] = useState(initialData);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [newEvent, setNewEvent] = useState({
    date: '',
    name: '',
  });
  const [viewMode, setViewMode] = useState('month');
  const [datesForMonth, setDatesForMonth] = useState([]);
  const [datesForWeek, setDatesForWeek] = useState([]);
  const [selectedWeekStart, setSelectedWeekStart] = useState(null);

  const generateDatesForMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = new Date(year, month, 1);
    const dates = [];

    while (date.getMonth() === month) {
      const formattedDate = date.toLocaleDateString('en-CA');
      dates.push({
        date: formattedDate,
        day: date.getDate(),
        events: calendarData.find((d) => d.date === formattedDate)?.events || [],
      });
      date.setDate(date.getDate() + 1);
    }

    return dates;
  };

  useEffect(() => {
    const generatedDates = generateDatesForMonth();
    setDatesForMonth(generatedDates);
  }, [calendarData]);

  const generateDatesForWeek = (selectedDate) => {
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - ((dayOfWeek + 6) % 7));

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const current = new Date(startOfWeek);
      current.setDate(startOfWeek.getDate() + i);
      const formattedDate = current.toLocaleDateString('en-CA');
      dates.push({
        date: formattedDate,
        day: current.getDate(),
        events: calendarData.find((d) => d.date === formattedDate)?.events || [],
      });
    }

    return dates;
  };

  const handleDayClick = (selectedDate) => {
    const weekDates = generateDatesForWeek(selectedDate);
    setDatesForWeek(weekDates);
    setSelectedWeekStart(selectedDate);
    setViewMode('week');
  };

  const handleAddNewEvent = (newEvent) => {
    const formattedDate = newEvent.date;
    setCalendarData((prevData) => {
      const updatedData = [...prevData];
      const dateIndex = updatedData.findIndex((day) => day.date === formattedDate);
      if (dateIndex !== -1) {
        updatedData[dateIndex].events.push({
          id: `${new Date().getTime()}`,
          name: newEvent.name,
        });
      } else {
        updatedData.push({
          date: formattedDate,
          events: [{ id: `${new Date().getTime()}`, name: newEvent.name }],
        });
      }
      console.log(updatedData);
      return updatedData;
    });
    setIsPopupVisible(false);
  };

  const handleDeleteEvent = (date, eventId) => {
    setCalendarData((prevData) => {
      const updatedData = prevData.map((day) => {
        if (day.date === date) {
          const filteredEvents = day.events.filter((event) => event.id !== eventId);
          return { ...day, events: filteredEvents };
        }
        return day;
      });
      return updatedData;
    });

    if (viewMode === 'week' && selectedWeekStart) {
      const updatedWeekDates = generateDatesForWeek(selectedWeekStart);
      setDatesForWeek(updatedWeekDates);
    }
  };

  const currentView = viewMode === 'month'
      ? <MonthlyView datesForMonth={datesForMonth} handleDayClick={handleDayClick} handleDeleteEvent={handleDeleteEvent} />
      : <WeeklyView datesForWeek={datesForWeek} handleDeleteEvent={handleDeleteEvent} />;

  return (
      <div id="calendar-view" className={styles.calendarView}>
        <div id="calendar-buttons" className={styles.calendarButtons}>
          <Button
              onClick={() => setViewMode('month')}
              customClass="primary"
          >
            <span>Monthly View</span>
          </Button>
          <Button
              onClick={() => setIsPopupVisible(true)}
              customClass="primary"
          >
            <span>Add Event</span>
          </Button>
        </div>
        {currentView}
        <AddEventForm
            show={isPopupVisible}
            setShow={setIsPopupVisible}
            onAddEvent={handleAddNewEvent}
        />
      </div>
  );
}
