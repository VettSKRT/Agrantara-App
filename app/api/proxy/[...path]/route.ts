import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const BACKEND_BASE = 'http://157.66.34.203/agriapp/api/web/v1';

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  console.log('🔥 PROXY HIT:', req.method, req.url);
  try {
    const { path } = await params;
    const { searchParams } = req.nextUrl;

    const targetPath = Array.isArray(path) ? path.join('/') : String(path || '');
    const url = new URL(`${BACKEND_BASE}/${targetPath}`);
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    const forwardHeaders = new Headers();
    req.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (['host', 'origin', 'referer', 'connection'].includes(lower)) return;
      forwardHeaders.set(key, value);
    });

    let body: BodyInit | undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (targetPath === 'auth/register' && req.method === 'POST') {
        const ct = (req.headers.get('content-type') || '').toLowerCase();
        if (ct.includes('application/x-www-form-urlencoded')) {
          const text = await req.text();
          const src = new URLSearchParams(text);
          const cleaned = new URLSearchParams();
          src.forEach((value, key) => { if (value.trim() !== '') cleaned.append(key, value); });
          body = cleaned.toString();
        } else {
          body = await req.arrayBuffer();
        }
      } else {
        body = await req.arrayBuffer();
      }
    }

    const resp = await fetch(url.toString(), {
      method: req.method,
      headers: forwardHeaders,
      body,
    });

    const buffer = await resp.arrayBuffer();
    const responseHeaders = new Headers();
    const contentType = resp.headers.get('content-type');
    if (contentType) responseHeaders.set('content-type', contentType);

    return new NextResponse(buffer, { status: resp.status, headers: responseHeaders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Proxy error';
    console.error('proxy error', err);
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  handler as HEAD,
};
