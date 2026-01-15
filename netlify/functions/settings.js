const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200 };
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
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ data: data || {} })
      };
    }

    if (event.httpMethod === 'PUT') {
      if (userLevel < 2) {
        return {
          statusCode: 403,
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
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ data })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
