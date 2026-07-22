import insforge from '../../../../lib/insforge';

const isAuthorized = (request: Request) => {
  const expectedToken = process.env.ADMIN_API_TOKEN;
  if (!expectedToken) return false;
  const token = request.headers.get('x-admin-api-token');
  return token === expectedToken;
};

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const hasConfig = !!process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY && !!process.env.NEXT_PUBLIC_INSFORGE_URL;
    if (hasConfig) {
      // Try to fetch orders table from InsForge
      const { data, error } = await insforge.database.from('orders').select();
      if (error) {
        return new Response(JSON.stringify({ orders: [] }), { status: 200 });
      }
      return new Response(JSON.stringify({ orders: data }), { status: 200 });
    }
  } catch (e) {
    // ignore
  }

  // Fallback sample data
  const sample = [
    { id: 'ord_001', buyer_name: 'Alice', inspo_image: '/images/sample-inspo.jpg', buyer_nail_photo: '/images/sample-buyer.jpg', items: { size: 'M', shape: 'Short Oval' }, status: 'Processing' },
    { id: 'ord_002', buyer_name: 'Bree', inspo_image: '', buyer_nail_photo: '', items: { size: 'L', shape: 'Long Almond' }, status: 'Shipped' },
  ];

  return new Response(JSON.stringify({ orders: sample }), { status: 200 });
}
