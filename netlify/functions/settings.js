const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-user-level',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders };
  }

  try {
    const userLevel = event.headers['x-user-level'];
    
    if (event.httpMethod === 'GET') {
      // Get all site settings
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ data: data || {} })
      };
    }

    if (event.httpMethod === 'PUT') {
      if (userLevel < 2) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Insufficient permissions' })
        };
      }

      const body = JSON.parse(event.body);
      const { data, error } = await supabase
        .from('site_settings')
        .upsert([body], { onConflict: 'id' })
        .select();

      if (error) throw error;

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ data })
      };
    }
  } catch (error) {
    console.error('Settings Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};
