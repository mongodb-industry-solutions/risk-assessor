// frontend/app/api/address/route.js

export async function POST(request) {
  try {
    // Get request body (JSON)
    const contentType = request.headers.get('content-type');
    let body;
    
    if (contentType?.includes('application/json')) {
      body = JSON.stringify(await request.json());
    } else {
      body = await request.text();
    }
    
    const backendUrl = process.env.INTERNAL_API_URL || 
                       process.env.NEXT_PUBLIC_API_URL || 
                       "http://localhost:8080";
    
    const url = `${backendUrl}/address/`;
    
    console.log(`🔗 Proxying POST request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: contentType ? { 'Content-Type': contentType } : {},
      body: body,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      return Response.json(error, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return Response.json(
      { error: 'Failed to connect to backend', details: error.message },
      { status: 500 }
    );
  }
}

