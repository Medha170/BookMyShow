const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const authMiddleware = require("../middlewares/authMiddleware");
const Booking = require("../models/bookingModel");
const Show = require("../models/showModel");
const EmailHelper = require("../utils/emailSender");
require("dotenv").config();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Webhook endpoint for Razorpay
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const secret = 'YOUR_RAZORPAY_WEBHOOK_SECRET';

  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    // Process the event
    const event = req.body.event;

    if (event === 'payment.captured') {
      const payment = req.body.payload.payment.entity;
      handlePaymentCaptured(payment);
    }

    res.json({ status: 'ok' });
  } else {
    res.status(400).send('Webhook signature verification failed.');
  }
});

// Function to handle payment.captured event
async function handlePaymentCaptured(payment) {
  console.log('Payment captured successfully');
  console.log(payment);
}

router.post("/make-payment", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const options = {
      amount: amount * 100, // amount in the smallest currency unit
      currency: currency,
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.send({
      success: true,
      message: "Order created successfully!",
      orderId: order.id
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message
    });
  }
});

// Create a booking after the payment
router.post("/book-show", async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();

    const show = await Show.findById(req.body.show).populate("movie");
    const updatedBookedSeats = [...show.bookedSeats, ...req.body.seats];
    await Show.findByIdAndUpdate(req.body.show, {
      bookedSeats: updatedBookedSeats
    });

    const populatedBooking = await Booking.findById(newBooking._id)
      .populate("user")
      .populate("show")
      .populate({
        path: "show",
        populate: {
          path: "movie",
          model: "movies"
        }
      })
      .populate({
        path: "show",
        populate: {
          path: "theatre",
          model: "theatres"
        }
      });

    res.send({
      success: true,
      message: "New Booking done!",
      data: populatedBooking
    });

    await EmailHelper("ticketTemplate.html", populatedBooking.user.email, {
      name: populatedBooking.user.name,
      movie: populatedBooking.show.movie.title,
      theatre: populatedBooking.show.theatre.name,
      date: populatedBooking.show.date,
      time: populatedBooking.show.time,
      seats: populatedBooking.seats,
      amount: populatedBooking.seats.length * populatedBooking.show.ticketPrice,
      transactionId: populatedBooking.transactionId
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message
    });
  }
});

router.get("/get-all-bookings", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.body.userId })
      .populate("user")
      .populate("show")
      .populate({
        path: "show",
        populate: {
          path: "movie",
          model: "movies"
        }
      })
      .populate({
        path: "show",
        populate: {
          path: "theatre",
          model: "theatres"
        }
      });

    res.send({
      success: true,
      message: "Bookings fetched!",
      data: bookings
    });
  } catch (err) {
    res.send({
      success: false,
      message: err.message
    });
  }
});

module.exports = router;

