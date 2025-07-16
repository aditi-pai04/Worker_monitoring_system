const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path'); // Import path module
const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json({ type: 'application/javascript' }));
app.use(cors());
app.use('/uploads', express.static('uploads')); // Serve static files from the 'uploads' directory

// Connect to MongoDB
mongoose.connect('mongodb+srv://aditinpai:Aditi$04@aicm.c4ywj.mongodb.net/?retryWrites=true&w=majority&appName=AICM', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define Manager schema

const ManagerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },  // Ensure email is unique
  location: { type: String, required: true },
  password: { type: String, required: true },  // Adding password field
  blueprintImage: { type: String }  // Adding blueprint image field
});
const workerSchema = new mongoose.Schema({
  name: String,
  email: String,
  phoneNumber: String,
  rfidId: String,
  uuid: { type: String, default: null },
});

const rfidReaderSchema = new mongoose.Schema({
  readerId: { type: String, required: true, unique: true },
  zoneId: { type: String, required: true },
});
const logSchema = new mongoose.Schema({
  deviceUUID: String, // This should match `beaconUUID` in your ESP32 code
  logs: [
    {
      scannerId: String,
      timestamp: String,
    }
  ]
});
// Blueprint model
const Blueprint = mongoose.model('Blueprint', new mongoose.Schema({
  blueprint_name: String,
  zones: [
      {
          zone_id: Number,
          coordinates: {
              x: Number,
              y: Number,
              width: Number,
              height: Number
          },
          esp_uuid: { type: String, default: null } // Add this field for ESP UUID
      }
  ]
}));
const Log = mongoose.model('Log', logSchema);
const Worker = mongoose.model('Worker', workerSchema);
const Manager = mongoose.model('Manager', ManagerSchema); // Collection name is `managers`
const RFIDReader = mongoose.model('RFIDReader', rfidReaderSchema);

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Uploads directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  }
});

const upload = multer({ storage });

// Route to handle registration
app.post('/register', upload.single('blueprintImage'), async (req, res) => {
  const { name, phoneNumber, email, location , password} = req.body;
  const blueprintImage = req.file ? req.file.filename : null;

  // Save the manager data to the database
  const newManager = new Manager({
    name,
    phoneNumber,
    email,
    location,
    password,
    blueprintImage: blueprintImage ? `/uploads/${blueprintImage}` : null // Save the image path
  });

  
  try {
    await newManager.save(); // Save the document to MongoDB
    res.status(200).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed', error });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      const manager = await Manager.findOne({ email });

      if (!manager) {
          return res.status(400).json({ message: 'Invalid email or password' });
      }

      if (manager.password !== password) {
          return res.status(400).json({ message: 'Invalid email or password' });
      }

      // If email and password match, send success response
      res.status(200).json({ message: 'Login successful!' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/register-worker', async (req, res) => {
  const { name, email, phoneNumber, uuid } = req.body; // Added uuid to the destructuring

  if (!name || !email || !phoneNumber ||  !uuid) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newWorker = new Worker({
      name,
      email,
      phoneNumber,
      uuid,  // Storing the uuid in the worker document
    });

    await newWorker.save();
    res.status(201).json({ message: 'Worker registered successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/register-reader', async (req, res) => {
  const { readerId, zoneId } = req.body;

  if (!readerId || !zoneId) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newReader = new RFIDReader({
      readerId,
      zoneId,
    });

    await newReader.save(); // This will create the 'rfidreaders' collection if it doesn't exist
    res.status(201).json({ message: 'RFID Reader registered successfully!' });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Duplicate reader ID' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

app.get('/log-entries', async (req, res) => {
  try {
    const logEntries = await Log.find().sort({ timestamp: -1 });  // Sort by most recent
    res.json(logEntries);
  } catch (error) {
    console.error('Error fetching log entries:', error);
    res.status(500).json({ message: 'Failed to fetch log entries' });
  }
});

app.post('/log', async (req, res) => {
  const { beaconUUID, scannerId, timestamp } = req.body;

  if (!beaconUUID || !scannerId || !timestamp) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let log = await Log.findOne({ deviceUUID: beaconUUID });

    if (log) {
      log.logs.push({ scannerId, timestamp });
    } else {
      log = new Log({
        deviceUUID: beaconUUID,
        logs: [{ scannerId, timestamp }],
      });
    }

    await log.save();
    res.status(200).json({ message: 'Log added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while adding the log' });
  }
});
// Fetch zones for the specific blueprint
app.get('/zones', async (req, res) => {
  try {
    const blueprintName = "floor_pan.jpg"; // Static blueprint name, modify as needed
    const blueprint = await Blueprint.findOne({ blueprint_name: blueprintName });
    if (blueprint) {
      res.json(blueprint.zones);
    } else {
      res.status(404).json({ message: 'Blueprint not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/zones/map-esp', async (req, res) => {
  console.log('Request body:', req.body); // Log the entire request body

  const { zone_id, esp_uuid } = req.body;
  const blueprint_name = 'floor_pan.jpg';

  try {
    console.log('Received data:', { zone_id, esp_uuid, blueprint_name });

    // Log the existing blueprint to verify its structure
    const existingBlueprint = await Blueprint.findOne({ blueprint_name: blueprint_name });
    console.log('Existing blueprint:', existingBlueprint);

    // Perform the update operation
    const updatedBlueprint = await Blueprint.findOneAndUpdate(
      { blueprint_name: blueprint_name, "zones.zone_id": zone_id },
      { $set: { "zones.$.esp_uuid": esp_uuid } },
      { new: true }
    );

    if (updatedBlueprint) {
      res.json({ message: 'ESP UUID mapped to zone successfully', blueprint: updatedBlueprint });
    } else {
      console.log('Blueprint or zone not found');
      res.status(404).json({ message: 'Zone or blueprint not found' });
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
app.get('/workers', async (req, res) => {
  try {
    const workers = await Worker.find({});
    res.json(workers);
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ message: 'Failed to fetch workers' });
  }
});
// Route to fetch logs for a worker based on UUID
app.get('/logdata', async (req, res) => {
  const { uuid } = req.query;

  if (!uuid) {
    return res.status(400).json({ message: 'UUID is required' });
  }

  try {
    // Fetch the logs for the given UUID, limiting to the last 10 entries
    const logs = await Log.find({ deviceUUID: uuid })
      .sort({ timestamp: -1 })
      .limit(10)
      .exec();

    res.status(200).json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.get('/workers-latest-zone', async (req, res) => {
  try {
    // Find the most recent zone for each worker
    const workers = await Worker.aggregate([
      {
        $lookup: {
          from: 'logs',
          localField: 'uuid',
          foreignField: 'deviceUUID',
          as: 'logs',
        },
      },
      {
        $addFields: {
          latestLog: { $arrayElemAt: ['$logs', 0] },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          zone: {
            x: '$latestLog.x',
            y: '$latestLog.y',
          },
        },
      },
    ]);

    res.status(200).json(workers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// app.get('/workers', async (req, res) => {
//   try {
//     const workers = await Worker.find();
//     res.json(workers);
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching workers' });
//   }
// });

// // Route to map UUID to a specific worker
// app.post('/workers/map-uuid', async (req, res) => {
//   const { worker_id, uuid } = req.body;

//   try {
//     // Find the worker by ID and update the UUID
//     await Worker.findByIdAndUpdate(worker_id, { uuid });
//     res.json({ message: 'UUID mapped successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Error mapping UUID' });
//   }
// });

// // New route to handle the screen for mapping worker UUIDs
// app.post('/workers/map-uuids', async (req, res) => {
//   const { workers } = req.body; // Expect an array of objects with worker_id and uuid

//   try {
//     const updatePromises = workers.map(worker =>
//       Worker.findByIdAndUpdate(worker.worker_id, { uuid: worker.uuid })
//     );

//     await Promise.all(updatePromises);
//     res.json({ message: 'UUIDs mapped successfully to workers' });
//   } catch (error) {
//     res.status(500).json({ error: 'Error mapping UUIDs to workers' });
//   }
// });
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
