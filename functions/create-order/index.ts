import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const {
      personalDetails,
      inspirationImage,
      designNotes,
      nailPhoto,
      selectedShape,
      sizingNotes,
      galleryItem,
      isGalleryFlow,
      totalAmount
    } = await req.json()

    // Get or create customer
    let { data: customer, error: customerError } = await supabaseClient
      .from('customers')
      .select('id')
      .eq('auth_id', user.id)
      .single()

    if (customerError && customerError.code === 'PGRST116') {
      // Customer doesn't exist, create one
      const { data: newCustomer, error: createError } = await supabaseClient
        .from('customers')
        .insert({
          auth_id: user.id,
          full_name: personalDetails.fullName,
          phone: personalDetails.phone,
          whatsapp: personalDetails.whatsapp,
          email: user.email
        })
        .select()
        .single()

      if (createError) {
        return new Response(JSON.stringify({ error: createError.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      customer = newCustomer
    } else if (customerError) {
      return new Response(JSON.stringify({ error: customerError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get nail shape ID
    let nailShapeId = null
    if (selectedShape) {
      const { data: nailShape } = await supabaseClient
        .from('nail_sizes')
        .select('id')
        .eq('name', selectedShape)
        .single()
      
      if (nailShape) {
        nailShapeId = nailShape.id
      }
    }

    // Get gallery product ID if applicable
    let galleryProductId = null
    if (isGalleryFlow && galleryItem) {
      const { data: product } = await supabaseClient
        .from('gallery_products')
        .select('id')
        .eq('name', galleryItem.name)
        .single()
      
      if (product) {
        galleryProductId = product.id
      }
    }

    // Create order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        customer_id: customer.id,
        gallery_product_id: galleryProductId,
        total_amount: totalAmount || 0,
        shipping_address: personalDetails.address,
        design_notes: designNotes,
        nail_shape_id: nailShapeId,
        sizing_notes: sizingNotes,
        status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      return new Response(JSON.stringify({ error: orderError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Upload inspiration image if provided
    if (inspirationImage) {
      const fileName = `inspiration-${order.id}-${Date.now()}`
      const { error: uploadError } = await supabaseClient
        .storage
        .from('reference-images')
        .upload(fileName, await fetch(inspirationImage).then(r => r.blob()))

      if (!uploadError) {
        const { data: { publicUrl } } = supabaseClient
          .storage
          .from('reference-images')
          .getPublicUrl(fileName)

        await supabaseClient
          .from('order_images')
          .insert({
            order_id: order.id,
            image_type: 'inspiration',
            image_url: publicUrl
          })
      }
    }

    // Upload nail photo if provided
    if (nailPhoto) {
      const fileName = `nail-photo-${order.id}-${Date.now()}`
      const { error: uploadError } = await supabaseClient
        .storage
        .from('reference-images')
        .upload(fileName, await fetch(nailPhoto).then(r => r.blob()))

      if (!uploadError) {
        const { data: { publicUrl } } = supabaseClient
          .storage
          .from('reference-images')
          .getPublicUrl(fileName)

        await supabaseClient
          .from('order_images')
          .insert({
            order_id: order.id,
            image_type: 'nail_photo',
            image_url: publicUrl
          })
      }
    }

    return new Response(JSON.stringify({ order }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
