const express = require('express');
const router = express.Router();

const {
    listCalendarEvent,
    listCalendarEventByPk,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent
} = require('./calendar_event');

/** calendar_event **/
router.get('/', listCalendarEvent);
router.get('/:calendar_event_id', listCalendarEventByPk);

//create calendar_event
router.post('/', createCalendarEvent);

//update calendar_event
router.put('/', updateCalendarEvent);

//delete calendar_event
router.delete('/:calendar_event_id', deleteCalendarEvent);

module.exports = router;