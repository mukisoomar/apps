const fs = require('fs');
const path = require('path');

const firstNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

const streets = [
  'Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Elm St', 'Pine Rd', 'Willow Way',
  'Birch Blvd', 'Walnut St', 'Chestnut Ave', 'Cherry St', 'Hickory Ln', 'Poplar Dr',
  'Spruce Ct', 'Ash Pl', 'Sycamore St', 'Magnolia Ave', 'Dogwood Rd', 'Redwood Dr',
  'Cypress Ln'
];

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
  'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
  'Fort Worth', 'Columbus', 'Charlotte', 'Indianapolis', 'San Francisco', 'Seattle',
  'Denver', 'Nashville'
];

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ'
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone() {
  const area = randInt(200, 999);
  const prefix = randInt(200, 999);
  const line = randInt(1000, 9999);
  return `(${area}) ${prefix}-${line}`;
}

function generateAddress() {
  const num = randInt(100, 9999);
  const street = rand(streets);
  const city = rand(cities);
  const state = rand(states);
  const zip = String(randInt(10000, 99999));
  return `${num} ${street}, ${city}, ${state} ${zip}`;
}

const records = [];
for (let i = 1; i <= 100; i++) {
  const name = `${rand(firstNames)} ${rand(lastNames)}`;
  const address = generateAddress();
  const phone = generatePhone();
  records.push({ id: i, name, address, phone });
}

const csvHeader = 'id,name,address,phone';
const csvRows = records.map(r =>
  `${r.id},"${r.name}","${r.address}","${r.phone}"`
);
const csvContent = [csvHeader, ...csvRows].join('\n');

const outputPath = path.join(__dirname, '..', 'data', 'customers.csv');
fs.writeFileSync(outputPath, csvContent, 'utf8');
console.log(`Generated ${records.length} customer records to ${outputPath}`);
