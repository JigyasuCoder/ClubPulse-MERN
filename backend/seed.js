const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const Event = require('./models/Event');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Database connected for seeding...');
  
  await Event.deleteMany({});
  await User.deleteMany({});

  // 1. Create Admin Account
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  const adminUser = new User({
    email: 'admin@codeio.com',
    password: hashedPassword,
  });
  await adminUser.save();
  console.log('Admin user created successfully!');

  // 2. Create Sample Event with 5 Criteria
  const sampleEvent = new Event({
    title: 'Full-Stack Web Dev Workshop',
    eventType: 'Technical Workshop',
    description: 'Hands-on session building MERN applications and deploying live.',
    passcode: '1234',
    criteria: [
      { key: 'speaker_clarity', label: 'Speaker & Explanation Clarity' },
      { key: 'coding_utility', label: 'Hands-on Coding & Practical Utility' },
      { key: 'workshop_pace', label: 'Pacing & Time Management' },
      { key: 'qa_interaction', label: 'Q&A & Support Interactivity' },
      { key: 'venue_equipment', label: 'Venue, Audio & Equipment Quality' },
    ],
  });
  await sampleEvent.save();
  console.log('Sample Event Created with 5 detailed criteria!');

  process.exit();
}).catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});