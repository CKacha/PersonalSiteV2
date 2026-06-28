export async function onRequestGet(): Promise<Response> {
  try {
    const res = await fetch(
      'https://www.reddit.com/r/shitposting/top.json?t=today&limit=1&raw_json=1',
      { headers: { 'User-Agent': 'personalsite/1.0' } }
    );
    if (!res.ok) return Response.json({ error: `reddit ${res.status}` }, { status: 502 });
    const json = await res.json();
    return Response.json(json);
  } catch (e) {
    return Response.json({ error: 'fetch failed' }, { status: 502 });
  }
}
