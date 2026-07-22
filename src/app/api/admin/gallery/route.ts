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

  // return sample gallery images
  const images = [
    '/images/gallery/sample1.jpg',
    '/images/gallery/sample2.jpg',
  ];
  return new Response(JSON.stringify({ images }), { status: 200 });
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // For demo, accept body and respond success
  try {
    const body = await req.json();
    if (!body?.url) return new Response(JSON.stringify({ ok: false }), { status: 400 });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false }), { status: 400 });
  }
}
