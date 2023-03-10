const router = require('express').Router();

const { verify } = require('../../../verifyToken');
const Appointments = require('../../../private/schemas/Appointments');
const { getUserAppointments, cancelUserAppointment } = require('../../../private/services/User/Appointments/appointments.service');


router.post('', verify, async (req, res, next) => {
    const user_id = req.user._id;

    const { status, facility_type } = req.body;

    // Appointments.find({ user_id, status }, (err, result) => {
    //     if (err) {
    //         return res.status(400).json({ message: 'Failed to load appointments' });
    //     }
    //     return res.status(200).send({ message: 'success', data: result });
    // }).clone();
    try {
        return res.status(200).json(await getUserAppointments({ user_id, status, facility_type }));
    } catch (error) {
        next(error);
    }
});


// create a new user appointment
router.post('/book-an-appointment', verify, async (req, res) => {
    const user_id = req.user._id;
    const {
        staff_id,
        facility_id,
        date,
        time,
        status,
        facility_type
    } = req.body;

    let current_date = new Date().toJSON().slice(0, 10)

    if (new Date(date) < new Date(current_date)) {
        return res.status(400).json({ message: 'provide a current or future date' })
    }

    await Appointments.create({
        user_id, staff_id, date, time, status, facility_id, facility_type
    }, (err, result) => {
        if (err) {
            return res.status(400).json({ message: "Failed to book appointment. Try again later", err });
        }
        return res.status(200).json({ message: "success", data: result });
    });
});


// allow a user to reschedule an appointment to a different date
router.post('/reschedule-appointment-date', verify, async (req, res) => {
    const user_id = req.user._id;
    const { appoint_id, date, time } = req.body;

    try {
        const result = await Appointments.updateOne({ user_id, _id: appoint_id }, { date, time });
        if (result == null) {
            return res.status(200).json({ message: "Failed to reschedule appointment." })
        }
        return res.status(200).json({ message: "success", data: result });
    } catch (error) {
        return res.status(400).json({ message: "An error occurred. Please try again later." });
    }
})

// allow a verified user to cancel an appointment
router.post('/cancel-an-appointment', verify, async (req, res, next) => {
    try {
        return res.status(200).json(await cancelUserAppointment({ req }))
    } catch (error) {
        next(error)
    }
})

module.exports = router;
