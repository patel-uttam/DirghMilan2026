/**
 * This is the main Node.js server script for your project
 * Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
 */

const fs = require('fs-extra');

const path = require("path");

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false,
});

// Optional: CORS for browser
fastify.register(require('@fastify/cors'), { origin: '*' });

// ADD FAVORITES ARRAY VARIABLE FROM TODO HERE

// Setup our static files
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/", // optional: default '/'
});

// Formbody lets us parse incoming forms
fastify.register(require("@fastify/formbody"));

// View is a templating manager for fastify
fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: require("handlebars"),
  },
});

// Load and parse SEO data
// const seo = require("./src/seo.json");
// if (seo.url === "glitch-default") {
//   seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
// }

const filePath = path.join(__dirname, '/attendance.json');

// Make sure the file exists and is initialized as an array
fs.ensureFileSync(filePath);
const currentData = fs.readJsonSync(filePath, { throws: false }) || [];
fs.writeJsonSync(filePath, currentData, { spaces: 2 });

// Declare a route
fastify.get('/', async function handler (request, reply) {
  return { hello: 'world' }
});

fastify.get('/attendees', async function handler (request, reply) {
  
    try {
    const data = await fs.readJson(path.join(__dirname, '/attendees.json'));
    reply.send(data);
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Failed to read attendees' });
  }
  
});

fastify.get('/questions', async function handler (request, reply) {
  try {
    const data = await fs.readJson("./src/questions.json");
    reply.send(data);
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Failed to read questions' });
  }
});

fastify.get('/attendanceList', async function handler (request, reply) {
  try {
    const data = await fs.readJson(filePath);
    reply.send(data);
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Failed to read attendance list' });
  }
});

// POST route to handle attendance data
fastify.post('/attendance', async (request, reply) => {
  const { id, name, taluko, kendra, varg, designation, timestamp } = request.body;

  if (!id || !name || !taluko || !kendra || !varg || !designation || !timestamp) {
    return reply.code(400).send({ error: 'Missing required fields' });
  }

  try {
    let data = await fs.readJson(filePath);
    let attende = {"id":id,"name":name,"taluko":taluko,"kendra":kendra,"varg":varg, "designation": designation, "timestamp":timestamp};
    data.push(attende);
    await fs.writeJson(filePath, data);

    reply.code(200).send(attende);
  } catch (err) {
    console.error('Write error:', err);
    reply.code(500).send({ error: 'Failed to save attendance' });
  }
});

// Run the server and report out to the logs
fastify.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
  }
);
