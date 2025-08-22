const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Article = require('./models/Article');
const Ticket = require('./models/Ticket');
const Config = require('./models/Config');
const { connectDB } = require('./config/db');

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@helpdesk.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Support Agent',
    email: 'agent@helpdesk.com',
    password: 'password123',
    role: 'agent'
  },
  {
    name: 'John Doe',
    email: 'user@helpdesk.com',
    password: 'password123',
    role: 'user'
  }
];

const articles = [
  {
    title: 'How to update payment method',
    body: 'To update your payment method, go to your account settings, select "Billing", and click "Update Payment Method". You can add a new credit card or update your existing one. Changes take effect immediately for future transactions.',
    tags: ['billing', 'payments'],
    status: 'published'
  },
  {
    title: 'Troubleshooting 500 errors',
    body: 'A 500 error indicates a server-side issue. First, try refreshing the page. If the error persists, clear your browser cache and cookies. For application-specific errors, check our status page for ongoing incidents.',
    tags: ['tech', 'errors'],
    status: 'published'
  },
  {
    title: 'Tracking your shipment',
    body: 'You can track your shipment using the tracking number provided in your confirmation email. Visit our tracking page and enter the number to see real-time updates on your package location and estimated delivery date.',
    tags: ['shipping', 'delivery'],
    status: 'published'
  }
];

const tickets = [
  {
    title: 'Refund for double charge',
    description: 'I was charged twice for order #1234 on June 15th. The second charge appears to be a mistake as I only placed one order.',
    category: 'billing'
  },
  {
    title: 'App shows 500 on login',
    description: 'When I try to login to the mobile app, I get a 500 error. This started happening after the latest update. I\'ve tried reinstalling but the issue persists.',
    category: 'tech'
  },
  {
    title: 'Where is my package?',
    description: 'My shipment was supposed to arrive 5 days ago but it\'s still showing as "in transit". The tracking number is TRK123456789. Can you check what\'s happening?',
    category: 'shipping'
  }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Article.deleteMany({});
    await Ticket.deleteMany({});
    await Config.deleteMany({});

    console.log('Data destroyed...');

    // Create users
    const createdUsers = [];
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      const newUser = await User.create({
        ...user,
        password: hashedPassword
      });
      createdUsers.push(newUser);
    }

    // Create articles
    const createdArticles = await Article.insertMany(articles);

    // Create tickets
    const user = createdUsers.find(u => u.role === 'user');
    const createdTickets = await Ticket.insertMany(
      tickets.map(ticket => ({
        ...ticket,
        createdBy: user._id
      }))
    );

    // Create default config
    await Config.create({
      autoCloseEnabled: true,
      confidenceThreshold: 0.7,
      slahours: 24
    });

    console.log('Data imported...');
    console.log('Users:', createdUsers.map(u => ({ email: u.email, role: u.role })));
    console.log('Articles:', createdArticles.map(a => a.title));
    console.log('Tickets:', createdTickets.map(t => t.title));

    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();