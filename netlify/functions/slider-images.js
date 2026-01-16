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
      console.log('GET /slider-images');
      const { data, error } = await supabase
        .from('slider_images')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Supabase GET error:', error);
        throw error;
      }
      
      console.log('GET /slider-images: Returned', data ? data.length : 0, 'images');

      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ data: data || [] })
      };
    }

    if (event.httpMethod === 'POST') {
      console.log('POST /slider-images');
      if (userLevel < 2) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Insufficient permissions' })
        };
      }

      const body = JSON.parse(event.body);
      console.log('Received body with URL length:', body.url ? body.url.length : 0);
      
      // If it's a base64 data URL, upload to Supabase Storage first
      if (body.url && body.url.startsWith('data:')) {
        console.log('Detected base64 data URL, attempting to upload to storage...');
        
        // Extract file type and data from data URL
        const matches = body.url.match(/^data:([^;]+);base64,(.+)$/) || [];
        const mimeType = matches[1] || 'image/jpeg';
        const base64Data = matches[2];
        
        if (!base64Data) {
          throw new Error('Invalid base64 data');
        }
        
        // Convert base64 to buffer
        const buffer = Buffer.from(base64Data, 'base64');
        
        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const fileExt = mimeType.split('/')[1] || 'jpg';
        const filename = `slider-${timestamp}-${random}.${fileExt}`;
        
        console.log('File size:', buffer.length, 'bytes');
        
        let publicUrl = null;
        
        // Try to upload to Supabase Storage
        try {
          console.log('Uploading to storage bucket: slider-images');
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('slider-images')
            .upload(filename, buffer, {
              contentType: mimeType,
              upsert: false
            });

          if (uploadError) {
            console.warn('Storage upload failed:', uploadError.message, '- will save base64 instead');
          } else {
            console.log('File uploaded to storage:', uploadData.path);
            
            // Get public URL
            const { data: publicUrlData } = supabase
              .storage
              .from('slider-images')
              .getPublicUrl(filename);
            
            publicUrl = publicUrlData.publicUrl;
            console.log('Public URL obtained:', publicUrl);
          }
        } catch (storageError) {
          console.warn('Storage error (non-critical):', storageError.message, '- will save base64 instead');
        }
        
        // If storage upload failed or no public URL, use the base64 directly as fallback
        const urlToSave = publicUrl || body.url;
        console.log('Saving to database, URL type:', publicUrl ? 'Storage URL' : 'Base64 data URL');
        
        // Save URL to database
        const { data, error } = await supabase
          .from('slider_images')
          .insert([{ url: urlToSave }])
          .select();

        if (error) {
          console.error('Database insert error:', error);
          throw new Error('Failed to save to database: ' + error.message);
        }
        
        console.log('Successfully saved to database');
        
        return {
          statusCode: 201,
          headers: corsHeaders,
          body: JSON.stringify({ data })
        };
      } else {
        // Regular URL, save directly to database
        console.log('Saving URL directly to database');
        const { data, error } = await supabase
          .from('slider_images')
          .insert([body])
          .select();

        if (error) {
          console.error('Database insert error:', error);
          throw new Error('Failed to save URL to database: ' + error.message);
        }
        
        console.log('Saved URL to database, returned', data.length, 'records');
        
        return {
          statusCode: 201,
          headers: corsHeaders,
          body: JSON.stringify({ data })
        };
      }
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
      
      // Get the image URL first so we can delete from storage
      const { data: imageData, error: selectError } = await supabase
        .from('slider_images')
        .select('url')
        .eq('id', id)
        .single();
      
      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error fetching image:', selectError);
        throw selectError;
      }
      
      // Extract filename from URL and delete from storage if it's a storage URL
      if (imageData && imageData.url && imageData.url.includes('/storage/')) {
        const url = imageData.url;
        const pathMatch = url.match(/slider-images\/(.+)$/);
        if (pathMatch) {
          const filename = pathMatch[1];
          console.log('Deleting from storage:', filename);
          
          const { error: deleteStorageError } = await supabase
            .storage
            .from('slider-images')
            .remove([filename]);
          
          if (deleteStorageError) {
            console.error('Storage delete error:', deleteStorageError);
            // Continue anyway, still delete from database
          }
        }
      }
      
      // Delete from database
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
