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
    const userLevel = parseInt(event.headers['x-user-level'] || '0');

    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('slider_images')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase GET error:', error);
        throw error;
      }
      
      console.log('GET /slider-images: Returned', data.length, 'images');

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ data })
      };
    }

    if (event.httpMethod === 'POST') {
      if (userLevel < 2) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Insufficient permissions' })
        };
      }

      const body = JSON.parse(event.body);
      console.log('POST /slider-images: Inserting image, URL length:', body.url ? body.url.length : 0);
      
      const { data, error } = await supabase
        .from('slider_images')
        .insert([body])
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      console.log('POST /slider-images: Success, returned', data.length, 'records');

      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({ data })
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
      const { id, ...updateData } = body;

      const { data, error } = await supabase
        .from('slider_images')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ data })
      };
    }

    if (event.httpMethod === 'DELETE') {
      if (userLevel < 2) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Insufficient permissions' })
        };
      }

      const id = event.queryStringParameters?.id;
      const { error } = await supabase
        .from('slider_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true })
      };
    }
  } catch (error) {
    console.error('Slider Images Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message || 'Internal server error' })
    };
  }
};
