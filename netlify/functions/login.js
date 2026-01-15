const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// User credentials (hardcoded for now - stored in your existing system)
const users = {
  '24250': { level: 3, name: 'Admin', email: 'admin@lfcgl.com' },
  'god is with us': { level: 2, name: 'Editor', email: 'editor@lfcgl.com' },
  'god is here': { level: 1, name: 'Member', email: 'member@lfcgl.com' }
};

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { password } = body;

    if (!password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Password required' })
      };
    }

    const user = users[password];
    if (!user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid password' })
      };
    }

    // Generate a simple token
    const token = Buffer.from(`${password}:${Date.now()}`).toString('base64');

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        user: { ...user, token },
        message: 'Login successful'
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
