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

    // GET - retrieve all slider images
    if (event.httpMethod === 'GET') {
      console.log('GET /slider-images - Fetching from database');
      const { data, error } = await supabase
        .from('slider_images')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching images:', error);
        throw error;
      }

      console.log('GET /slider-images - Found', data ? data.length : 0, 'images');
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ data: data || [] })
      };
    }

    // POST - create new slider image
    if (event.httpMethod === 'POST') {
      if (userLevel < 2) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Insufficient permissions' })
        };
      }

      const body = JSON.parse(event.body);
      console.log('POST /slider-images - Inserting image, URL length:', body.url ? body.url.length : 0);
      
      const { data, error } = await supabase
        .from('slider_images')
        .insert([{ url: body.url }])
        .select();

      if (error) {
        console.error('Database insert error:', error);
        throw error;
      }

      console.log('POST /slider-images - Success! Saved image with ID:', data[0]?.id);

      return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({ data })
      };
    }

    // PUT - update slider image
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

    // DELETE - remove slider image
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

    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
};
