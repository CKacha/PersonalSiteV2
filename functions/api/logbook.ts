interface Env {
  DB: {
    prepare(sql: string): {
      all(): Promise<{ results: unknown[] }>;
      bind(...values: unknown[]): { run(): Promise<void> };
    };
  };
  DELETE_PASSWORD: string;
}

export async function onRequestGet({ env }: { env: Env }): Promise<Response> {
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, type, name, message, drawing, created_at
       FROM entries
       ORDER BY RANDOM()
       LIMIT 200`
    ).all();
    return Response.json(results);
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Failed to load entries.' }, { status: 500 });
  }
}

export async function onRequestPost({ env, request }: { env: Env; request: Request }): Promise<Response> {
  try {
    const body = (await request.json()) as {
      type?: string;
      name?: string;
      message?: string;
      drawing?: string;
      bot_check?: string;
    };

    if (body.bot_check !== 'Iamnotarobot') {
      return Response.json({ error: 'Bot check failed.' }, { status: 400 });
    }

    const name = String(body.name ?? '').trim().slice(0, 50);
    if (!name) return Response.json({ error: 'Name is required.' }, { status: 400 });

    if (body.type === 'text') {
      const message = String(body.message ?? '').trim().slice(0, 1000);
      if (!message) return Response.json({ error: 'Message is required.' }, { status: 400 });
      await env.DB.prepare('INSERT INTO entries (type, name, message) VALUES (?, ?, ?)')
        .bind('text', name, message)
        .run();

    } else if (body.type === 'draw') {
      const drawing = String(body.drawing ?? '');
      if (!drawing.startsWith('data:image/')) {
        return Response.json({ error: 'Invalid drawing.' }, { status: 400 });
      }
      if (drawing.length > 3_000_000) {
        return Response.json({ error: 'Drawing too large.' }, { status: 400 });
      }
      await env.DB.prepare('INSERT INTO entries (type, name, drawing) VALUES (?, ?, ?)')
        .bind('draw', name, drawing)
        .run();

    } else {
      return Response.json({ error: 'Invalid type.' }, { status: 400 });
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Server error.' }, { status: 500 });
  }
}

export async function onRequestDelete({ env, request }: { env: Env; request: Request }): Promise<Response> {
  try {
    const body = (await request.json()) as { id?: number; password?: string };

    if (!body.password || body.password !== env.DELETE_PASSWORD) {
      return Response.json({ error: 'Incorrect password.' }, { status: 403 });
    }

    if (!body.id) return Response.json({ error: 'ID required.' }, { status: 400 });

    await env.DB.prepare('DELETE FROM entries WHERE id = ?').bind(body.id).run();
    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: 'Server error.' }, { status: 500 });
  }
}
