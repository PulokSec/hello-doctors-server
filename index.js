const express = require('express');
const cors = require('cors');
const {MongoClient} = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('doctors'));



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uth2f.mongodb.net/hello-doc-db?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect((err) => {
	const database = client.db('hello-doc-db');
	const doctorCollection = database.collection('doctors');
	const usersCollection = database.collection('users');
	const appointmentCollection = database.collection('appointments');
	const reviewCollection = database.collection('reviews');

	console.log('Hello Doctors DataBase Connected');

	//Routes -- Get method
	// Root Route
	app.get('/', (req, res) => res.send('Welcome to Hello Doctors Backend'));

	// Get all services Information
	app.get('/doctors', (req, res) => {
		doctorCollection.find({}).toArray((err, documents) => {
			res.send(documents);
		});
	});

	// Get all Booked Appointments
	app.get('/bookedAppointments', (req, res) => {
		appointmentCollection.find({}).toArray((err, documents) => {
			res.send(documents);
		});
	});

	// Get all Reviews
	app.get('/allReviews', (req, res) => {
		reviewCollection.find({}).toArray((err, documents) => {
			res.send(documents);
		});
	});

	//Routes -- Post method
	// Added all doctors Information
	app.post('/addDoctor', (req, res) => {
		const doctorData = req.body;
		doctorCollection.insertMany(doctorData).then((result) => {
			console.log(result.insertedCount, 'All Data Inserted');
			res.send(result.insertedCount);
		});
	});
	//user --
	app.post('/users', async (req, res) => {
		const user = req.body;
		const result = await usersCollection.insertOne(user);
		console.log(result);
		res.json(result);
});

app.get('/users/:email', async (req, res) => {
	const email = req.params.email;
	const query = { email: email };
	const user = await usersCollection.findOne(query);
	let isAdmin = false;
	if (user?.role === 'admin') {
			isAdmin = true;
	}
	res.json({ admin: isAdmin });
})

	app.put('/users', async (req, res) => {
	const user = req.body;
	const filter = { email: user.email };
	const options = { upsert: true };
	const updateDoc = { $set: user };
	const result = await usersCollection.updateOne(filter, updateDoc, options);
	res.json(result);
});
	//admin-----
	app.put('/users/admin', async (req, res) => {
		const user = req.body;
		console.log(user.email);
						const filter = { email: user.email };
						const updateDoc = { $set: { role: 'admin' } };
						const result = await usersCollection.updateOne(filter, updateDoc);
						res.json(result);				
})
	// Insert Appointment Booking
	app.post('/makeBooking', (req, res) => {
		const appointmentData = req.body;
		appointmentCollection.insertOne(appointmentData, (err, result) => {
			console.log(result.insertedCount, 'Appointment Inserted');
			res.send(result.insertedCount > 0);
		});
	});

	// Insert A New Doctor
	app.post('/addADoctor', (req, res) => {
		const id = req.body.id;
		const category = req.body.category;
		const name = req.body.name;
		const education = req.body.education;
		const designation = req.body.designation;
		const department = req.body.department;
		const hospital = req.body.hospital;
		const img = req.body.img;


		doctorCollection
			.insertOne({ id, category, name, education, designation, department, hospital, img })
			.then((result) => {
				res.send(result.insertedCount > 0);
				console.log(result.insertedCount, 'Doctor Inserted');
			});
	});
	// Added A New Doctor Review
	app.post('/addReview', (req, res) => {
		const reviewData = req.body;
		reviewCollection.insertOne(reviewData).then((result) => {
			res.send(result.insertedCount > 0);
			console.log(result.insertedCount, 'Review Data Inserted');
		});
	});

	//Routes -- Update method
	// Updating Booking Status
	app.post('/updateBookingStatus', (req, res) => {
		const ap = req.body;
		appointmentCollection.updateOne(
			{ _id: ObjectId(ap.id) },
			{
				$set: { status: ap.status },
				$currentDate: { lastModified: true }
			},
			(err, result) => {
				if (err) {
					console.log(err);
					res.status(500).send({ message: err });
				} else {
					res.send(result.modifiedCount > 0);
					console.log(result.modifiedCount, 'Update Booking Status');
				}
			}
		);
	});

	// Updating Appointment Date/Time
	app.post('/updateAppointmentTime', (req, res) => {
		const ap = req.body;
		appointmentCollection.updateOne(
			{ _id: ObjectId(ap.id) },
			{
				$set: { date: ap.date, time: ap.time },
				$currentDate: { lastModified: true }
			},
			(err, result) => {
				if (err) {
					console.log(err);
					res.status(500).send({ message: err });
				} else {
					res.send(result.modifiedCount > 0);
					console.log(result.modifiedCount, 'Update Appointment Date / Time');
				}
			}
		);
	});

	// Added Meeting Link
	app.post('/addedMeetingLink', (req, res) => {
		const ap = req.body;
		appointmentCollection.updateOne(
			{ _id: ObjectId(ap.id) },
			{
				$set: { meeting: ap.meeting },
				$currentDate: { lastModified: true }
			},
			(err, result) => {
				if (err) {
					console.log(err);
					res.status(500).send({ message: err });
				} else {
					res.send(result.modifiedCount > 0);
					console.log(result.modifiedCount, 'Meeting Link Added');
				}
			}
		);
	});

	// Updating Appointment Visiting Status
	app.post('/updateVisitingStatus', (req, res) => {
		const ap = req.body;
		appointmentCollection.updateOne(
			{ _id: ObjectId(ap.id) },
			{
				$set: { visitingStatus: ap.visitingStatus },
				$currentDate: { lastModified: true }
			},
			(err, result) => {
				if (err) {
					console.log(err);
					res.status(500).send({ message: err });
				} else {
					res.send(result.modifiedCount > 0);
					console.log(result.modifiedCount, 'Update Visitors Status');
				}
			}
		);
	});

	// Updating Prescription
	app.post('/updatePrescription', (req, res) => {
		const ap = req.body;
		appointmentCollection.updateOne(
			{ _id: ObjectId(ap.id) },
			{
				$set: { prescription: ap.prescription },
				$currentDate: { lastModified: true }
			},
			(err, result) => {
				if (err) {
					console.log(err);
					res.status(500).send({ message: err });
				} else {
					res.send(result.modifiedCount > 0);
					console.log(result.modifiedCount, 'Update Prescription');
				}
			}
		);
	});

	// Updating Disease
	app.post('/updateDisease', (req, res) => {
		const ap = req.body;
		appointmentCollection.updateOne(
			{ _id: ObjectId(ap.id) },
			{
				$set: { disease: ap.problem },
				$currentDate: { lastModified: true }
			},
			(err, result) => {
				if (err) {
					console.log(err);
					res.status(500).send({ message: err });
				} else {
					res.send(result.modifiedCount > 0);
					console.log(result.modifiedCount, 'Update Disease');
				}
			}
		);
	});

	// Added Payment
	app.post('/addedPayment', (req, res) => {
		const ap = req.body;
		appointmentCollection.updateOne(
			{ _id: ObjectId(ap.id) },
			{
				$set: { paymentID: ap.paymentID },
				$currentDate: { lastModified: true }
			},
			(err, result) => {
				if (err) {
					console.log(err);
					res.status(500).send({ message: err });
				} else {
					res.send(result.modifiedCount > 0);
					console.log(result.modifiedCount, 'Payment Inserted');
				}
			}
		);
	});

});

const port = process.env.PORT || 5000;
app.listen(port, (err) => (err ? console.log('Filed to Listen on Port', port) : console.log('Listing for Port', port)));
